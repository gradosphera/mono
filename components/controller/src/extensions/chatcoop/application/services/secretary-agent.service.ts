import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { WhisperSttService } from './whisper-stt.service';
import { TranscriptionManagementService } from '../../domain/services/transcription-management.service';
import { MatrixApiService } from './matrix-api.service';
import { EXTENSION_REPOSITORY } from '~/domain/extension/repositories/extension-domain.repository';
import type { ExtensionDomainRepository } from '~/domain/extension/repositories/extension-domain.repository';
import { decrypt } from '~/utils/aes';
import config from '~/config/config';
import { Room, RoomEvent, TrackKind, AudioStream, AudioResampler } from '@livekit/rtc-node';
import { AccessToken } from 'livekit-server-sdk';
import { promises as fs } from 'fs';

// Параметры VAD (Voice Activity Detection)
const VAD_THRESHOLD = 0.01; // RMS порог для определения речи
const SILENCE_TIMEOUT_MS = 800; // Таймаут тишины для сброса буфера (мс)
const MIN_BUFFER_DURATION_MS = 1000; // Минимальная длительность буфера (1 сек). Whisper не работает с микрофреймами.
const MAX_BUFFER_DURATION_MS = 30000; // Максимальная длительность буфера (30 сек)
// Whisper API ожидает 16kHz mono PCM. Запрашиваем 16kHz напрямую у LiveKit,
// чтобы исключить ошибки ресемплинга (ранее 48k→16k давало скрежет в WAV).
const WHISPER_SAMPLE_RATE = 16000;

/** Диагностика: true = запрашиваем 16k mono у LiveKit, без ресемплинга и downmix */
const USE_DIRECT_16K_MONO = process.env.SECRETARY_DIRECT_16K === '1';

// Буфер аудио для одного участника
interface ParticipantAudioBuffer {
  participantIdentity: string;
  participantName: string;
  sampleRate: number;
  channels: number;
  audioBuffer: Buffer;
  bufferSize: number;
  maxBufferSize: number;
  totalSamples: number;
  /** Сырой поток ДО ресемплинга (48k stereo) — для диагностики */
  rawAudioBuffer: Buffer;
  rawBufferSize: number;
  rawSampleRate: number; // 48000
  rawChannels: number; // 2
  /** Сырой поток ВСЕ фреймы как пришли (без VAD) — сохраняется при flush */
  streamDebugBuffer: Buffer;
  streamDebugSize: number;
  streamDebugSampleRate: number;
  streamDebugChannels: number;
  lastSpeechTimestamp: number;
  isSpeaking: boolean;
  silenceTimer: ReturnType<typeof setTimeout> | null;
}

// Информация об активной комнате
interface ActiveRoom {
  room: unknown; // Room из @livekit/rtc-node (тип unknown для компиляции без пакета)
  livekitRoomName: string; // Имя комнаты для проверки активности
  transcriptionId: string;
  matrixRoomId: string;
  startedAt: Date;
  audioBuffers: Map<string, ParticipantAudioBuffer>;
  knownParticipants: Set<string>; // Для мониторинга участников
  monitoringInterval?: NodeJS.Timeout; // Для периодического мониторинга
}

/**
 * Ядро агента-секретаря
 *
 * Подключается к комнатам LiveKit, подписывается на аудио-треки,
 * выполняет VAD (Voice Activity Detection) и буферизацию,
 * отправляет аудио на распознавание через Whisper API,
 * сохраняет сегменты транскрипции в БД,
 * отправляет сообщения в Matrix-чат о подключении/отключении.
 */
const CHATCOOP_EXTENSION_NAME = 'chatcoop';
const SECRETARY_TOKEN_EXPIRY_MS = 23 * 60 * 60 * 1000; // 23 часа (Matrix токены долгоживущие)

@Injectable()
export class SecretaryAgentService implements OnModuleDestroy {
  private readonly logger = new Logger(SecretaryAgentService.name);
  private activeRooms = new Map<string, ActiveRoom>();
  private secretaryAccessToken: string | null = null;
  private secretaryTokenExpiry: Date | null = null;

  constructor(
    private readonly whisperSttService: WhisperSttService,
    private readonly transcriptionService: TranscriptionManagementService,
    private readonly matrixApiService: MatrixApiService,
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository
  ) {}

  async onModuleDestroy(): Promise<void> {
    // Отключаемся от всех активных комнат при завершении модуля
    for (const [roomName] of this.activeRooms) {
      try {
        await this.leaveRoom(roomName);
      } catch (error) {
        this.logger.error(`Ошибка при отключении от комнаты ${roomName}: ${error}`);
      }
    }
  }

  /**
   * Проверяет, настроен ли сервис для работы
   */
  isConfigured(): boolean {
    return !!(config.livekit?.url && config.livekit?.api_key && config.livekit?.api_secret);
  }

  /**
   * Получает access token секретаря (с кэшированием). Возвращает null, если credentials не настроены.
   */
  private async getSecretaryAccessToken(): Promise<string | null> {
    if (this.secretaryAccessToken && this.secretaryTokenExpiry && this.secretaryTokenExpiry > new Date()) {
      return this.secretaryAccessToken;
    }

    const plugin = await this.extensionRepository.findByName(CHATCOOP_EXTENSION_NAME);
    if (!plugin?.config?.secretaryMatrixUserId || !plugin?.config?.secretaryPasswordEncrypted) {
      return null;
    }

    try {
      const password = decrypt(plugin.config.secretaryPasswordEncrypted);
      const username = String(plugin.config.secretaryMatrixUserId).replace(/^@/, '').split(':')[0];
      const loginResponse = await this.matrixApiService.loginUser(username, password);

      this.secretaryAccessToken = loginResponse.access_token;
      this.secretaryTokenExpiry = new Date(Date.now() + SECRETARY_TOKEN_EXPIRY_MS);
      return this.secretaryAccessToken;
    } catch (error) {
      this.logger.warn(`Не удалось войти секретарём в Matrix: ${error}`);
      return null;
    }
  }

  /**
   * Отправляет сообщение в Matrix-чат от имени секретаря. При отсутствии credentials — fallback на админа.
   */
  private async sendMatrixMessage(matrixRoomId: string, message: string): Promise<void> {
    const secretaryToken = await this.getSecretaryAccessToken();
    if (secretaryToken) {
      await this.matrixApiService.sendMessageWithToken(matrixRoomId, message, secretaryToken);
    } else {
      this.logger.warn('Credentials секретаря не найдены, отправка от имени администратора');
      await this.matrixApiService.sendMessage(matrixRoomId, message);
    }
  }

  /**
   * Подключается к LiveKit-комнате и начинает транскрипцию
   * Отправляет текстовое сообщение в Matrix-чат о подключении
   */
  async joinRoom(livekitRoomName: string, matrixRoomId: string, roomDisplayName: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('SecretaryAgentService не настроен (отсутствуют LIVEKIT параметры)');
      return;
    }

    if (this.activeRooms.has(livekitRoomName)) {
      this.logger.warn(`Секретарь уже подключен к комнате ${livekitRoomName}`);
      return;
    }

    try {
      this.logger.log(`Секретарь подключается к комнате ${livekitRoomName} (matrix: ${matrixRoomId})`);

      // 1. Генерируем LiveKit токен для секретаря
      // ВАЖНО: подключаемся к комнате по matrixRoomId (именно так livekit-jwt-service создаёт токены для участников)
      // livekitRoomName — это SHA256-хэш, используемый только для маппинга webhook→Matrix
      const token = new AccessToken(config.livekit.api_key, config.livekit.api_secret, {
        identity: `secretary-agent`,
        name: 'Секретарь',
      });
      token.addGrant({
        roomJoin: true,
        room: livekitRoomName, // Matrix room ID — реальное имя LiveKit комнаты для участников
        canSubscribe: true,
        canPublish: true,
        hidden: false,
      });
      const jwt = await token.toJwt();
      this.logger.log(`🎫 Токен для секретаря: room=${matrixRoomId}, canSubscribe=true, canPublish=false`);

      // 2. Создаем запись транскрипции в БД
      const transcription = await this.transcriptionService.createTranscription({
        roomId: livekitRoomName,
        matrixRoomId: matrixRoomId,
        roomName: roomDisplayName,
      });

      // 3. Создаем комнату и регистрируем обработчики ДО подключения
      const room = new Room();
      const activeRoom: ActiveRoom = {
        room,
        livekitRoomName,
        transcriptionId: transcription.id,
        matrixRoomId: matrixRoomId,
        startedAt: new Date(),
        audioBuffers: new Map(),
        knownParticipants: new Set(),
      };

      this.activeRooms.set(livekitRoomName, activeRoom);

      // 5. Подключаемся к комнате
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.logger.log(`🔌 Подключаемся к LiveKit: ${config.livekit!.url}`);
      await room.connect(config.livekit!.url!, jwt, { autoSubscribe: true, dynacast: true });
      this.logger.log(`✅ Подключение к комнате ${livekitRoomName} установлено`);

      // 4. Регистрируем обработчики событий ДО подключения
      this.logger.log(`🎧 Регистрируем обработчики событий комнаты...`);

      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        this.logger.log(`👤 УЧАСТНИК ПОДКЛЮЧИЛСЯ: ${participant.identity} (${participant.name || 'unknown'}) - remote=${participant !== room.localParticipant}`);
        this.transcriptionService.addParticipant(activeRoom.transcriptionId, participant.identity);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: any) => {
        this.logger.log(`👤 УЧАСТНИК ОТКЛЮЧИЛСЯ: ${participant.identity} - remote=${participant !== room.localParticipant}`);
        // Сбрасываем буфер при отключении
        const buffer = activeRoom.audioBuffers.get(participant.identity);
        if (buffer) {
          this.flushBuffer(buffer, activeRoom);
          activeRoom.audioBuffers.delete(participant.identity);
        }
      });

      room.on(RoomEvent.TrackPublished, (publication: any, participant: any) => {
        this.logger.log(`📢 ТРЕК ОПУБЛИКОВАН: ${publication.kind} от ${participant.identity} - remote=${participant !== room.localParticipant}`);
        if (publication.kind === TrackKind.KIND_AUDIO) {
          this.logger.log(`🎵 АУДИО-ТРЕК! Подписываемся...`);
          publication.setSubscribed(true);
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
        const src = (publication as any)?.source ?? '?';
        const srcStr = String(src).toLowerCase();
        this.logger.log(`🎤 ТРЕК ПОДПИСАН: ${track.kind} от ${participant.identity} source=${src} sid=${track.sid}`);
        if (track.kind === TrackKind.KIND_AUDIO) {
          // Пропускаем только screen_share_audio — берём microphone и unknown
          if (srcStr.includes('screen') || srcStr.includes('share')) {
            this.logger.warn(`⚠️ Пропускаем трек source=${src} (screen share)`);
            return;
          }
          this.logger.log(`🎧 АУДИО-ТРЕК (source=${src}) — начинаем обработку`);
          this.processParticipantAudio(track, participant, activeRoom);
        }
      });

      room.on(RoomEvent.TrackUnpublished, (publication: any, participant: any) => {
        this.logger.log(`📴 ТРЕК СНЯТ С ПУБЛИКАЦИИ: ${publication.kind} от ${participant.identity}`);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: any, publication: any, participant: any) => {
        this.logger.log(`📴 ТРЕК ОТПИСАН: ${track.kind} от ${participant.identity}`);
      });

      room.on(RoomEvent.ConnectionStateChanged, (state: any) => {
        this.logger.log(`🔄 СОСТОЯНИЕ ПОДКЛЮЧЕНИЯ: ${state}`);
      });

      room.on(RoomEvent.RoomMetadataChanged, (metadata: any) => {
        this.logger.log(`📋 МЕТАДАННЫЕ КОМНАТЫ ИЗМЕНИЛИСЬ: ${metadata}`);
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: any) => {
        this.logger.log(`🎤 АКТИВНЫЕ ГОВОРЯЩИЕ: ${speakers.map((s: any) => s.identity).join(', ')}`);
      });

      room.on(RoomEvent.Disconnected, (reason: any) => {
        this.logger.warn(`❌ СЕКРЕТАРЬ ОТКЛЮЧЁН ОТ КОМНАТЫ! reason=${reason}`);
      });

      // Тест: синхронная проверка что EventEmitter Room работает
      let emitterTestPassed = false;
      room.once('__test__' as any, () => { emitterTestPassed = true; });
      room.emit('__test__' as any, 'ok');
      this.logger.log(`🔧 EventEmitter test: ${emitterTestPassed ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`);

      // Логируем состояние после подключения
      this.logger.log(`🏠 СОСТОЯНИЕ КОМНАТЫ ПОСЛЕ ПОДКЛЮЧЕНИЯ:`);
      this.logger.log(`  - Локальный участник: ${room.localParticipant?.identity} (${room.localParticipant?.name || 'unknown'})`);
      this.logger.log(`  - Удаленных участников: ${room.remoteParticipants.size}`);
      this.logger.log(`  - Состояние подключения: ${room.connectionState}`);
      this.logger.log(`  - Известных участников: ${activeRoom.knownParticipants.size}`);

      // Проверяем FfiClient ПОСЛЕ connect (он должен быть инициализирован)
      const postConnectFfi = (global as any)._ffiClientInstance;
      this.logger.log(`🔬 FfiClient после connect: ${postConnectFfi ? '✅ существует' : '❌ НЕ НАЙДЕН'}`);
      if (postConnectFfi) {
        this.logger.log(`🔬 FfiClient listeners count: ${postConnectFfi.listenerCount?.('ffi_event') ?? 'unknown'}`);
      }

      // 6. Ждем немного для установления соединения и получения треков
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 7. Подписываемся на уже существующие аудио-треки
      this.logger.log(`🔍 Проверяем существующие треки в комнате... (${room.remoteParticipants.size} участников)`);
      for (const [, participant] of room.remoteParticipants) {
        this.logger.log(`👤 Участник ${participant.identity}: ${participant.trackPublications.size} треков`);
        for (const [, publication] of participant.trackPublications) {
          this.logger.log(`  - Трек ${publication.kind}: subscribed=${publication.subscribed}`);
          if (publication.kind === TrackKind.KIND_AUDIO && !publication.subscribed) {
            this.logger.log(
              `🎵 Подписываемся на существующий аудио-трек: ${participant.identity} (${participant.name || 'unknown'})`
            );
            try {
              publication.setSubscribed(true);
              this.logger.log(`✅ Подписка на трек ${participant.identity} установлена`);
            } catch (error) {
              this.logger.error(`❌ Ошибка подписки на трек ${participant.identity}: ${error}`);
            }
          }
        }
      }

      // 8. Принудительно запрашиваем обновление состояния комнаты
      this.logger.log(`🔄 Запрашиваем обновление состояния комнаты...`);
      try {
        // Проверяем, есть ли метод для принудительного обновления
        if (typeof room['syncState'] === 'function') {
          await room['syncState']();
          this.logger.log(`✅ Синхронизация состояния выполнена`);
        }
      } catch (error) {
        this.logger.warn(`⚠️ Синхронизация состояния недоступна: ${error}`);
      }

      // 8. Добавляем уже присутствующих участников в транскрипцию
      for (const [, participant] of room.remoteParticipants) {
        this.logger.log(`👤 Найден существующий участник: ${participant.identity} (${participant.name || 'unknown'})`);
        await this.transcriptionService.addParticipant(transcription.id, participant.identity);
      }
      // Добавляем уже присутствующих участников
      for (const [, participant] of room.remoteParticipants) {
        this.logger.log(`👤 Найден существующий участник: ${participant.identity} (${participant.name || 'unknown'})`);
        await this.transcriptionService.addParticipant(transcription.id, participant.identity);
      }

      // 5. Отправляем сообщение в Matrix-чат о подключении секретаря (от имени секретаря)
      try {
        await this.sendMatrixMessage(
          matrixRoomId,
          `🤖 Секретарь подключился к звонку и начал запись транскрипции.`
        );
      } catch (error) {
        this.logger.warn(`Не удалось отправить сообщение о подключении секретаря: ${error}`);
      }

      this.logger.log(`Секретарь успешно подключился к комнате ${livekitRoomName}, транскрипция: ${transcription.id}`);
    } catch (error) {
      this.logger.error(`Ошибка подключения секретаря к комнате ${livekitRoomName}: ${error}`);
    }
  }

  /**
   * Обрабатывает аудио-трек участника:
   * AudioStream(16kHz) -> VAD -> Buffer -> Whisper -> Store segment
   *
   * LiveKit AudioStream запрашивается с sampleRate=16000, чтобы сразу получать
   * данные в формате, ожидаемом Whisper API. Ранее цепочка 48k→16k через
   * AudioResampler давала скрежет и неверную транскрипцию.
   */
  private async processParticipantAudio(
    track: any,
    participant: any,
    activeRoom: ActiveRoom
  ): Promise<void> {
    try {
      this.logger.log(`🎧 Начинаю обработку аудио-потока: ${participant.name || participant.identity}`);
      // Режим диагностики: 16k mono напрямую (без ресемплинга/downmix) или 48k stereo
      const [reqSampleRate, reqChannels] = USE_DIRECT_16K_MONO ? [16000, 1] : [48000, 2];
      if (USE_DIRECT_16K_MONO) this.logger.log(`🔧 ДИАГНОСТИКА: AudioStream(16000, 1) — без ресемплинга/downmix`);
      const audioStream = new AudioStream(track, reqSampleRate, reqChannels);
      const participantId = participant.identity;

      // Буфер под 48k stereo (макс); после ресемплинга будет 16k
      const maxBufferBytes = Math.ceil((MAX_BUFFER_DURATION_MS / 1000) * 48000 * 2 * 2);
      const rawMaxBytes = Math.ceil((MAX_BUFFER_DURATION_MS / 1000) * 48000 * 2 * 2);
      const streamDebugMaxBytes = 60 * 48000 * 2 * 2;
      const buffer: ParticipantAudioBuffer = {
        participantIdentity: participantId,
        participantName: participant.name || participantId,
        sampleRate: WHISPER_SAMPLE_RATE,
        channels: 1,
        audioBuffer: Buffer.alloc(maxBufferBytes),
        bufferSize: 0,
        maxBufferSize: maxBufferBytes,
        totalSamples: 0,
        rawAudioBuffer: Buffer.alloc(rawMaxBytes),
        rawBufferSize: 0,
        rawSampleRate: 48000,
        rawChannels: 2,
        streamDebugBuffer: Buffer.alloc(streamDebugMaxBytes),
        streamDebugSize: 0,
        streamDebugSampleRate: 48000,
        streamDebugChannels: 2,
        lastSpeechTimestamp: Date.now(),
        isSpeaking: false,
        silenceTimer: null,
      };

      activeRoom.audioBuffers.set(participantId, buffer);
      let firstFrameLogged = false;
      let resampler: AudioResampler | null = null;
      let frameCount = 0;

      // КЛЮЧЕВОЙ МОМЕНТ: track — это только хэндл (sid, info, ffi_handle).
      // Реальные PCM-данные приходят ЗДЕСЬ — при каждой итерации audioStream
      // отдаёт новый AudioFrame. AudioStream внутри подписывается на track
      // через FFI и конвертирует RTP/Opus в PCM. Если frame.data — нули,
      // смотри логи ниже (samplesPreview, min, max, rms).
      for await (const frame of audioStream) {
          if (!this.activeRooms.has(activeRoom.livekitRoomName)) break;

          frameCount++;

          // ОТЛАДКА: каждый фрейм → streamDebug (сохраняется при flush)
          const streamPcm = this.audioFrameToBuffer(frame);
          if (streamPcm && buffer.streamDebugSize + streamPcm.length <= buffer.streamDebugBuffer.length) {
            streamPcm.copy(buffer.streamDebugBuffer, buffer.streamDebugSize);
            buffer.streamDebugSize += streamPcm.length;
          }
          if (frame.sampleRate) buffer.streamDebugSampleRate = frame.sampleRate;
          if (frame.channels) buffer.streamDebugChannels = frame.channels;

          if (!firstFrameLogged) {
          const data = frame.data;
          const sampleRate = frame.sampleRate ?? 0;
          const channels = frame.channels ?? 0;
          const samplesPerChannel = frame.samplesPerChannel ?? 0;
          const dataLength = data?.length ?? 0;
          const expectedLength = samplesPerChannel * channels;
          const lengthOk = dataLength === expectedLength;

          this.logger.log(`\n${'='.repeat(70)}`);
          this.logger.log(`  🎯 РЕАЛЬНЫЕ ПАРАМЕТРЫ FRAME (из LiveKit, без предположений)`);
          this.logger.log(`${'='.repeat(70)}`);
          this.logger.log(`  SAMPLE_RATE       = ${sampleRate}`);
          this.logger.log(`  CHANNELS          = ${channels}`);
          this.logger.log(`  SAMPLES_PER_CHANNEL = ${samplesPerChannel}`);
          this.logger.log(`  DATA.LENGTH       = ${dataLength}`);
          this.logger.log(`  DATA_LENGTH === SAMPLES_PER_CHANNEL * CHANNELS  →  ${dataLength} === ${expectedLength}  →  ${lengthOk ? '✅ OK' : '❌ НЕСОВПАДЕНИЕ'}`);
          this.logger.log(`  dataType          = ${data?.constructor?.name ?? '?'}`);
          if (data?.length > 0) {
            const samplesPreview = Array.from(data.slice(0, 8)).join(', ') + (data.length > 8 ? '...' : '');
            const min = Math.min(...Array.from(data));
            const max = Math.max(...Array.from(data));
            const pcmForRms = this.audioFrameToBuffer(frame);
            const rms = pcmForRms ? this.calculateRMS(pcmForRms) : 0;
            this.logger.log(`  samples[0:8]      = [${samplesPreview}]`);
            this.logger.log(`  min, max, rms     = ${min}, ${max}, ${rms.toFixed(6)}`);
          }
          const debugRawPath = '/app/tmp/debug_first_frame.raw';
          const firstFramePcm = this.audioFrameToBuffer(frame);
          if (firstFramePcm) {
            fs.writeFile(debugRawPath, firstFramePcm).catch(err =>
              this.logger.warn(`Не удалось сохранить debug.raw: ${err}`)
            );
          }
          this.logger.log(`  Тест ffplay: ffplay -f s16le -ar ${sampleRate} -ac ${channels} ${debugRawPath}`);
          this.logger.log(`${'='.repeat(70)}\n`);

          buffer.sampleRate = sampleRate;
          buffer.channels = channels;

          if (sampleRate !== WHISPER_SAMPLE_RATE) {
            this.logger.log(`  ⚙️ Включен ресемплинг ${sampleRate}Hz → ${WHISPER_SAMPLE_RATE}Hz`);
            resampler = new AudioResampler(sampleRate, WHISPER_SAMPLE_RATE, channels);
            buffer.sampleRate = WHISPER_SAMPLE_RATE;
          }
          if (channels > 1) {
            this.logger.log(`  ⚙️ Стерео (${channels}ch) → downmix в моно при отправке в Whisper`);
          }
          firstFrameLogged = true;
        }

        // Периодически проверяем, что фреймы продолжают приходить (frameCount растёт)
        if (frameCount > 0 && frameCount % 500 === 0) {
          const pcmCheck = this.audioFrameToBuffer(frame);
          const rmsCheck = pcmCheck ? this.calculateRMS(pcmCheck) : 0;
          this.logger.log(
            `📊 Фрейм #${frameCount} [${buffer.participantName}]: rms=${rmsCheck.toFixed(6)}, dataLen=${frame.data?.length ?? 0}`
          );
        }

        // При необходимости ресемплим до 16kHz
        const framesToProcess = resampler
          ? resampler.push(frame)
          : [frame];
        const rawFramePcm = resampler ? this.audioFrameToBuffer(frame) : null;
        let rawFrameAddedThisIteration = false;

        for (const f of framesToProcess) {
          const pcmData = this.audioFrameToBuffer(f);
          if (!pcmData || pcmData.length === 0) continue;

        const rms = this.calculateRMS(pcmData);

        if (rms > VAD_THRESHOLD) {
          if (!buffer.isSpeaking) {
            this.logger.log(`🗣️  РЕЧЬ ОБНАРУЖЕНА: ${buffer.participantName} (RMS: ${rms.toFixed(3)})`);
          }
          buffer.isSpeaking = true;
          buffer.lastSpeechTimestamp = Date.now();

          // Накопление RAW 48k stereo до ресемплинга (для диагностики)
          if (rawFramePcm && !rawFrameAddedThisIteration && buffer.rawBufferSize + rawFramePcm.length <= buffer.rawAudioBuffer.length) {
            rawFramePcm.copy(buffer.rawAudioBuffer, buffer.rawBufferSize);
            buffer.rawBufferSize += rawFramePcm.length;
            rawFrameAddedThisIteration = true;
          }

          if (buffer.bufferSize + pcmData.length <= buffer.maxBufferSize) {
            pcmData.copy(buffer.audioBuffer, buffer.bufferSize);
            buffer.bufferSize += pcmData.length;
            buffer.totalSamples += pcmData.length / 2;
          } else {
            this.logger.warn(`⚠️ Буфер переполнен для ${buffer.participantName}, сбрасываем`);
            await this.flushBuffer(buffer, activeRoom);
            pcmData.copy(buffer.audioBuffer, buffer.bufferSize);
            buffer.bufferSize += pcmData.length;
            buffer.totalSamples += pcmData.length / 2;
          }

          if (buffer.silenceTimer) {
            clearTimeout(buffer.silenceTimer);
            buffer.silenceTimer = null;
          }

          const durationMs = (buffer.totalSamples / buffer.channels / buffer.sampleRate) * 1000;
          if (durationMs >= MAX_BUFFER_DURATION_MS) {
            this.logger.log(`⏰ Максимальная длительность буфера достигнута: ${buffer.participantName}`);
            await this.flushBuffer(buffer, activeRoom);
          }
        } else if (buffer.isSpeaking) {
          if (!buffer.silenceTimer) {
            buffer.silenceTimer = setTimeout(async () => {
              this.logger.log(`⏳ Таймер тишины сработал: ${buffer.participantName}`);
              await this.flushBuffer(buffer, activeRoom);
            }, SILENCE_TIMEOUT_MS);
          }
        }
        }
        }
    } catch (error) {
      this.logger.error(`Ошибка обработки аудио участника ${participant.identity}: ${error}`);
    }
  }

  /**
   * Преобразует AudioFrame в Buffer (PCM 16-bit LE).
   * Явная запись через writeInt16LE — исключает shared-buffer и byte-order.
   */
  private audioFrameToBuffer(
    frame: { data: Int16Array | Float32Array }
  ): Buffer {

    const data = frame.data;

    // CASE 1 — уже Int16
    if (data instanceof Int16Array) {
      const buf = Buffer.allocUnsafe(data.length * 2);
      for (let i = 0; i < data.length; i++) {
        buf.writeInt16LE(data[i], i * 2);
      }
      return buf;
    }

    // CASE 2 — Float32 [-1.0, 1.0]
    if (data instanceof Float32Array) {
      const buf = Buffer.allocUnsafe(data.length * 2);

      for (let i = 0; i < data.length; i++) {
        let sample = data[i];

        // защита
        if (sample > 1) sample = 1;
        if (sample < -1) sample = -1;

        const int16 = sample < 0
          ? sample * 0x8000
          : sample * 0x7fff;

        buf.writeInt16LE(int16, i * 2);
      }

      return buf;
    }

    throw new Error("Unknown audio frame format");
  }

  /**
   * Подготовка PCM для Whisper: стерео→моно (downmix).
   * LiveKit по умолчанию 48k stereo interleaved. Чтение как mono = шум.
   */
  private preparePcmForWhisper(pcmBuffer: Buffer, channels: number): Buffer {
    if (channels > 1) {
      this.logger.log(`🔄 Downmix стерео→моно (${channels}ch)`);
      return this.stereoToMono(pcmBuffer);
    }
    return pcmBuffer;
  }

  /** Downmix стерео (interleaved L,R,L,R...) в моно: (L+R)>>1. Рекомендация LiveKit/WebRTC. */
  private stereoToMono(pcmBuffer: Buffer): Buffer {
    const numSamples = pcmBuffer.length / 4;
    const out = Buffer.alloc(numSamples * 2);
    for (let i = 0, j = 0; i < pcmBuffer.length; i += 4, j++) {
      const l = pcmBuffer.readInt16LE(i);
      const r = pcmBuffer.readInt16LE(i + 2);
      const mono = (l + r) >> 1;
      out.writeInt16LE(Math.max(-32768, Math.min(32767, mono)), j * 2);
    }
    return out;
  }

  /**
   * Вычисляет RMS (Root Mean Square) для PCM-буфера (16-bit signed)
   */
  private calculateRMS(pcmBuffer: Buffer): number {
    const samples = pcmBuffer.length / 2;
    if (samples === 0) return 0;

    let sumSquares = 0;
    for (let i = 0; i < pcmBuffer.length; i += 2) {
      const sample = pcmBuffer.readInt16LE(i) / 32768; // Нормализация к [-1, 1]
      sumSquares += sample * sample;
    }

    return Math.sqrt(sumSquares / samples);
  }

  /**
   * Сбрасывает буфер аудио: объединяет, отправляет на Whisper, сохраняет сегмент
   */
  private async flushBuffer(buffer: ParticipantAudioBuffer, activeRoom: ActiveRoom): Promise<void> {
    this.logger.log(`🔄 Начинаю сброс буфера: ${buffer.participantName} (${buffer.bufferSize} байт аудио)`);

    // ОТЛАДКА: сохраняем RAW STREAM + варианты (byte-swap, planar→interleaved)
    if (buffer.streamDebugSize > 0) {
      try {
        const safeId = buffer.participantIdentity.replace(/[:@]/g, '_');
        const ts = Date.now();
        const rawPcm = Buffer.from(buffer.streamDebugBuffer.subarray(0, buffer.streamDebugSize));
        const sr = buffer.streamDebugSampleRate;
        const ch = buffer.streamDebugChannels;
        const dur = (buffer.streamDebugSize / 2 / ch / sr).toFixed(1);
        const fmt = `${sr}_${ch}ch`;

        const base = `/app/tmp/debug_${fmt}_${safeId}_${ts}`;
        await fs.writeFile(`${base}.raw`, rawPcm);

        // WAV с заголовком — play без параметров: play xxx.wav
        const wavHeader = this.createWavHeader(rawPcm.length, sr, ch);
        await fs.writeFile(`${base}.wav`, Buffer.concat([wavHeader, rawPcm]));

        // Моно (только L-канал) — на случай проблем со стерео
        if (ch === 2) {
          const mono = Buffer.alloc(rawPcm.length / 2);
          for (let i = 0; i < mono.length / 2; i++) {
            mono.writeInt16LE(rawPcm.readInt16LE(i * 4), i * 2);
          }
          await fs.writeFile(`${base}_monoL.raw`, mono);
          const wavMono = this.createWavHeader(mono.length, sr, 1);
          await fs.writeFile(`${base}_monoL.wav`, Buffer.concat([wavMono, mono]));
        }

        // byte-swap, planar
        const swapped = Buffer.alloc(rawPcm.length);
        for (let i = 0; i < rawPcm.length; i += 2) {
          swapped[i] = rawPcm[i + 1];
          swapped[i + 1] = rawPcm[i];
        }
        await fs.writeFile(`${base}_swapped.raw`, swapped);

        if (ch === 2) {
          const spc = buffer.streamDebugSize / 4;
          const interleaved = Buffer.alloc(rawPcm.length);
          for (let i = 0; i < spc; i++) {
            interleaved.writeInt16LE(rawPcm.readInt16LE(i * 2), i * 4);
            interleaved.writeInt16LE(rawPcm.readInt16LE((spc + i) * 2), i * 4 + 2);
          }
          await fs.writeFile(`${base}_planar2int.raw`, interleaved);
        }

        const metaLines = [
          `sr=${sr} ch=${ch} dur=${dur}s`,
          `play ${base}.wav`,
          ...(ch === 2 ? [`play ${base}_monoL.wav`] : []),
          `play -t raw -r ${sr} -e signed -b 16 -c ${ch} ${base}.raw`,
          `# если бульканье — попробуй др. sample rate:`,
          `play -t raw -r 44100 -e signed -b 16 -c ${ch} ${base}.raw`,
          `play -t raw -r 24000 -e signed -b 16 -c ${ch} ${base}.raw`,
          `# или SECRETARY_DIRECT_16K=1 для 16k mono`,
        ];
        await fs.writeFile(`${base}.meta`, metaLines.join('\n'));

        this.logger.log(`📼 DEBUG: ${buffer.streamDebugSize} байт = ${dur} сек, ${sr}Hz ${ch}ch`);
        this.logger.log(`   play ${base}.wav  |  play ${base}_monoL.wav  |  см. ${base}.meta`);
      } catch (err) {
        this.logger.warn(`Не удалось сохранить debug_raw_stream: ${err}`);
      }
    }

    // Очищаем таймер
    if (buffer.silenceTimer) {
      clearTimeout(buffer.silenceTimer);
      buffer.silenceTimer = null;
    }

    const durationMs = (buffer.totalSamples / buffer.channels / buffer.sampleRate) * 1000;
    if (durationMs < MIN_BUFFER_DURATION_MS || buffer.bufferSize === 0) {
      this.logger.log(`⚠️  Буфер слишком короткий: ${durationMs.toFixed(1)}ms < ${MIN_BUFFER_DURATION_MS}ms`);
      buffer.bufferSize = 0;
      buffer.totalSamples = 0;
      buffer.isSpeaking = false;
      return;
    }

    // Получаем аудио данные из буфера (только заполненную часть).
    // ВАЖНО: Buffer.slice() возвращает VIEW с общим underlying memory. Цикл for-await
    // продолжает писать в buffer.audioBuffer (после сброса bufferSize). Поэтому копируем
    // данные СРАЗУ — иначе save/transcribe получат повреждённые данные.
    let combinedBuffer = Buffer.from(buffer.audioBuffer.subarray(0, buffer.bufferSize));
    const startOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000 - durationMs / 1000;
    const endOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000;

    // Очищаем буфер
    buffer.bufferSize = 0;
    buffer.totalSamples = 0;
    buffer.isSpeaking = false;

    // ОТЛАДКА: RAW до ресемплинга — .raw (чистый PCM)
    if (buffer.rawBufferSize > 0 && buffer.rawSampleRate && buffer.rawChannels) {
      const rawPcm = Buffer.from(buffer.rawAudioBuffer.subarray(0, buffer.rawBufferSize));
      const safeId = buffer.participantIdentity.replace(/[:@]/g, '_');
      const rawPath = `/app/tmp/debug_before_resample_${safeId}_${Date.now()}.raw`;
      await fs.writeFile(rawPath, rawPcm);
      const dur = (rawPcm.length / 2 / buffer.rawChannels / buffer.rawSampleRate).toFixed(1);
      this.logger.log(`📼 RAW (до ресемплинга .raw): ${rawPcm.length} байт = ${dur} сек → ${rawPath}`);
      this.logger.log(`   ffplay: ffplay -f s16le -ar ${buffer.rawSampleRate} -ac ${buffer.rawChannels} ${rawPath}`);
    }
    buffer.rawBufferSize = 0;

    // Нормализация: стерео→моно (убирает фазовые артефакты), опционально swap байт (металлический шум)
    let outChannels = buffer.channels;
    const pcmForOutput = this.preparePcmForWhisper(combinedBuffer, buffer.channels);
    if (buffer.channels > 1) outChannels = 1;

    try {
      this.logger.log(
        `Отправляем на распознавание аудио участника ${buffer.participantName} (${durationMs.toFixed(1)}ms)`
      );

      // ОТЛАДКА: Сохраняем аудио-файл на диск перед отправкой в Whisper
      const debugAudioPath = `/app/tmp/debug_audio_${buffer.participantIdentity}_${Date.now()}.wav`;
      await this.saveAudioBufferAsWav(pcmForOutput, buffer.sampleRate, debugAudioPath, outChannels);
      this.logger.log(
        `🔊 Аудио: ${pcmForOutput.length} байт PCM = ${(pcmForOutput.length / 2 / outChannels / buffer.sampleRate).toFixed(1)} сек, ${buffer.sampleRate}Hz, ${outChannels}ch`
      );

      const text = await this.whisperSttService.transcribe(
        pcmForOutput,
        buffer.sampleRate,
        undefined,
        outChannels
      );

      if (text && text.trim().length > 0) {
        const trimmedText = text.trim();
        this.logger.log(
          `✅ ТРАНСКРИПЦИЯ: [${buffer.participantName}] "${trimmedText}" (${startOffset.toFixed(1)}s - ${endOffset.toFixed(1)}s)`
        );

        // Сохраняем сегмент транскрипции
        const segment = await this.transcriptionService.addSegment({
          transcriptionId: activeRoom.transcriptionId,
          speakerIdentity: buffer.participantIdentity,
          speakerName: buffer.participantName,
          text: trimmedText,
          startOffset: Math.max(0, startOffset),
          endOffset: endOffset,
        });

        this.logger.log(`💾 Сегмент сохранен в БД: id=${segment.id}`);
      } else {
        this.logger.warn(`⚠️  Пустой результат распознавания для ${buffer.participantName}`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Ошибка распознавания речи участника ${buffer.participantIdentity}: ${error}`
      );
    }
  }

  /**
   * Отключается от комнаты и завершает транскрипцию
   * Отправляет текстовое сообщение в Matrix-чат об отключении
   */
  async leaveRoom(livekitRoomName: string): Promise<void> {
    const activeRoom = this.activeRooms.get(livekitRoomName);
    if (!activeRoom) {
      this.logger.warn(`Секретарь не подключен к комнате ${livekitRoomName}`);
      return;
    }

    try {
      this.logger.log(`Секретарь отключается от комнаты ${livekitRoomName}`);

      // Останавливаем мониторинг
      if (activeRoom.monitoringInterval) {
        clearInterval(activeRoom.monitoringInterval);
        this.logger.log(`🛑 Мониторинг комнаты ${livekitRoomName} остановлен`);
      }

      // Сбрасываем все оставшиеся буферы
      for (const [, buffer] of activeRoom.audioBuffers) {
        await this.flushBuffer(buffer, activeRoom);
      }

      // Отключаемся от LiveKit-комнаты
      try {
        const room = activeRoom.room as any;
        if (room && typeof room.disconnect === 'function') {
          await room.disconnect();
        }
      } catch (error) {
        this.logger.warn(`Ошибка при отключении от LiveKit: ${error}`);
      }

      // Завершаем транскрипцию
      await this.transcriptionService.completeTranscription(activeRoom.transcriptionId);

      // Отправляем сообщение в Matrix-чат об отключении секретаря (от имени секретаря)
      try {
        await this.sendMatrixMessage(
          activeRoom.matrixRoomId,
          `🤖 Секретарь отключился от звонка. Транскрипция завершена и сохранена.`
        );
      } catch (error) {
        this.logger.warn(`Не удалось отправить сообщение об отключении секретаря: ${error}`);
      }

      this.activeRooms.delete(livekitRoomName);
      this.logger.log(`Секретарь отключился от комнаты ${livekitRoomName}`);
    } catch (error) {
      this.logger.error(`Ошибка при отключении секретаря от комнаты ${livekitRoomName}: ${error}`);
      // Всё равно удаляем из карты активных комнат
      this.activeRooms.delete(livekitRoomName);
    }
  }

  /**
   * Проверяет, подключен ли секретарь к комнате
   */
  isInRoom(livekitRoomName: string): boolean {
    return this.activeRooms.has(livekitRoomName);
  }

  /**
   * Запускает периодический мониторинг состояния комнаты как fallback для событий
   */
  private startRoomMonitoring(activeRoom: ActiveRoom, roomName: string): void {
    this.logger.log(`🔄 Запускаем мониторинг комнаты ${roomName} каждые 5 секунд`);

    activeRoom.monitoringInterval = setInterval(async () => {
      try {
        const room = activeRoom.room as any; // Room из @livekit/rtc-node
        const currentParticipants = new Set(room.remoteParticipants.keys());

        // Проверяем новых участников
        for (const [, participant] of room.remoteParticipants) {
          if (!activeRoom.knownParticipants.has(participant.identity)) {
            this.logger.log(`📊 МОНИТОРИНГ: Найден новый участник ${participant.identity} (${participant.name || 'unknown'})`);
            activeRoom.knownParticipants.add(participant.identity);
            await this.transcriptionService.addParticipant(activeRoom.transcriptionId, participant.identity);

            // Проверяем треки нового участника
            for (const [, publication] of participant.trackPublications) {
              if (publication.kind === TrackKind.KIND_AUDIO && !publication.subscribed) {
                this.logger.log(`📊 МОНИТОРИНГ: Подписываемся на аудио-трек ${participant.identity}`);
                publication.setSubscribed(true);
              }
            }
          }
        }

        // Проверяем отключенных участников
        for (const knownIdentity of activeRoom.knownParticipants) {
          if (!currentParticipants.has(knownIdentity)) {
            this.logger.log(`📊 МОНИТОРИНГ: Участник ${knownIdentity} отключился`);
            activeRoom.knownParticipants.delete(knownIdentity);
            // Сбрасываем буфер
            const buffer = activeRoom.audioBuffers.get(knownIdentity);
            if (buffer) {
              this.flushBuffer(buffer, activeRoom);
              activeRoom.audioBuffers.delete(knownIdentity);
            }
          }
        }


      } catch (error) {
        this.logger.error(`Ошибка мониторинга комнаты ${roomName}: ${error}`);
      }
    }, 5000); // Каждые 5 секунд
  }

  /**
   * Сохраняет PCM буфер как WAV файл для отладки
   */
  private async saveAudioBufferAsWav(
    pcmBuffer: Buffer,
    sampleRate: number,
    filePath: string,
    channels = 1
  ): Promise<void> {
    try {
      const wavHeader = this.createWavHeader(pcmBuffer.length, sampleRate, channels);
      const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
      await fs.writeFile(filePath, wavBuffer);
      this.logger.log(
        `✅ WAV файл сохранен: ${filePath} (${wavBuffer.length} байт, ${sampleRate}Hz, ${channels}ch)`
      );
    } catch (error) {
      this.logger.error(`❌ Ошибка сохранения WAV файла ${filePath}: ${error}`);
    }
  }

  /**
   * Создает WAV заголовок для PCM данных (16-bit)
   */
  private createWavHeader(dataLength: number, sampleRate: number, channels = 1): Buffer {
    const bitsPerSample = 16;
    const blockAlign = channels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;

    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);

    return header;
  }
}
