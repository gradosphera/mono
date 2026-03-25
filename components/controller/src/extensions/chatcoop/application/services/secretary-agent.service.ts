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

// Параметры VAD (Voice Activity Detection)
const VAD_THRESHOLD = 0.01; // RMS порог для определения речи
const SILENCE_TIMEOUT_MS = 800; // Таймаут тишины для сброса буфера (мс)
const MIN_BUFFER_DURATION_MS = 1000; // Минимальная длительность буфера (1 сек). Whisper не работает с микрофреймами.
const MAX_BUFFER_DURATION_MS = 30000; // Максимальная длительность буфера (30 сек)
const WHISPER_SAMPLE_RATE = 16000;

/** Запрос к AudioStream: нативный для WebRTC 48 kHz stereo (далее ресемплинг в 16 kHz для Whisper). */
const LIVEKIT_STREAM_SAMPLE_RATE = 48000;
const LIVEKIT_STREAM_CHANNELS = 2;

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
   * Matrix MXID секретаря из конфигурации расширения chatcoop (пишется при инициализации в ChatCoopPlugin).
   * Для LiveKit/Element identity должен совпадать с этим пользователем, иначе клиент не сопоставит участника и E2EE.
   */
  private async resolveSecretaryLiveKitParticipant(): Promise<{ identity: string; name: string }> {
    const plugin = await this.extensionRepository.findByName(CHATCOOP_EXTENSION_NAME);
    const raw = plugin?.config?.secretaryMatrixUserId;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      const mxid = raw.trim().startsWith('@') ? raw.trim() : `@${raw.trim()}`;
      return { identity: mxid, name: 'Секретарь' };
    }
    this.logger.warn(
      'secretaryMatrixUserId нет в конфиге chatcoop — LiveKit identity=fallback secretary-agent'
    );
    return { identity: 'secretary-agent', name: 'Секретарь' };
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

      const { identity: secretaryLiveKitIdentity, name: secretaryLiveKitName } =
        await this.resolveSecretaryLiveKitParticipant();

      // 1. Генерируем LiveKit токен для секретаря
      // identity = Matrix MXID из конфига (secretaryMatrixUserId), как у участников Element
      // livekitRoomName — имя комнаты LiveKit для join (часто hash/mapping от Matrix room)
      const token = new AccessToken(config.livekit.api_key, config.livekit.api_secret, {
        identity: secretaryLiveKitIdentity,
        name: secretaryLiveKitName,
      });
      token.addGrant({
        roomJoin: true,
        room: livekitRoomName,
        canSubscribe: true,
        canPublish: true,
        hidden: false,
      });
      const jwt = await token.toJwt();
      this.logger.debug(
        `LiveKit JWT: identity=${secretaryLiveKitIdentity}, room=${livekitRoomName}`
      );

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
      };

      this.activeRooms.set(livekitRoomName, activeRoom);

      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        this.logger.log(`Участник подключился: ${participant.identity}`);
        void this.transcriptionService.addParticipant(activeRoom.transcriptionId, participant.identity);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: any) => {
        this.logger.log(`Участник отключился: ${participant.identity}`);
        const buf = activeRoom.audioBuffers.get(participant.identity);
        if (buf) {
          void this.flushBuffer(buf, activeRoom).catch((e) =>
            this.logger.error(`Сброс буфера при отключении ${participant.identity}: ${e}`)
          );
          activeRoom.audioBuffers.delete(participant.identity);
        }
      });

      room.on(RoomEvent.TrackPublished, (publication: any, _participant: any) => {
        if (publication.kind === TrackKind.KIND_AUDIO) {
          publication.setSubscribed(true);
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
        const src = (publication as any)?.source ?? '?';
        const srcStr = String(src).toLowerCase();
        if (track.kind === TrackKind.KIND_AUDIO) {
          if (srcStr.includes('screen') || srcStr.includes('share')) {
            this.logger.debug(`Пропуск аудио-трека (screen): ${participant.identity} source=${src}`);
            return;
          }
          this.logger.log(`Аудио-трек: ${participant.identity} source=${src}`);
          void this.processParticipantAudio(track, participant, activeRoom);
        }
      });

      room.on(RoomEvent.Disconnected, (reason: unknown) => {
        this.logger.warn(`Секретарь отключён от LiveKit: ${String(reason)}`);
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await room.connect(config.livekit!.url!, jwt, { autoSubscribe: true, dynacast: true });
      this.logger.log(`LiveKit: подключено к ${livekitRoomName}, remoteParticipants=${room.remoteParticipants.size}`);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      for (const [, participant] of room.remoteParticipants) {
        for (const [, publication] of participant.trackPublications) {
          if (publication.kind === TrackKind.KIND_AUDIO && !publication.subscribed) {
            try {
              publication.setSubscribed(true);
            } catch (error) {
              this.logger.error(`Подписка на аудио ${participant.identity}: ${error}`);
            }
          }
        }
      }

      for (const [, participant] of room.remoteParticipants) {
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
      const stuck = this.activeRooms.get(livekitRoomName);
      if (stuck) {
        try {
          const r = stuck.room as { disconnect?: () => Promise<void> };
          if (r?.disconnect) await r.disconnect();
        } catch {
          /* ignore */
        }
        this.activeRooms.delete(livekitRoomName);
      }
    }
  }

  /**
   * Обрабатывает аудио-трек участника:
   * AudioStream (48 kHz stereo) → ресемплинг при необходимости → VAD → буфер → Whisper → сегмент в БД.
   */
  private async processParticipantAudio(
    track: any,
    participant: any,
    activeRoom: ActiveRoom
  ): Promise<void> {
    const participantId = participant.identity;

    try {
      this.logger.log(`Аудио-поток: ${participant.name || participantId}`);
      const audioStream = new AudioStream(track, LIVEKIT_STREAM_SAMPLE_RATE, LIVEKIT_STREAM_CHANNELS);

      const pcmBytesPerSec = LIVEKIT_STREAM_SAMPLE_RATE * LIVEKIT_STREAM_CHANNELS * 2;
      const maxBufferBytes = Math.ceil((MAX_BUFFER_DURATION_MS / 1000) * pcmBytesPerSec);
      const buffer: ParticipantAudioBuffer = {
        participantIdentity: participantId,
        participantName: participant.name || participantId,
        sampleRate: WHISPER_SAMPLE_RATE,
        channels: 1,
        audioBuffer: Buffer.alloc(maxBufferBytes),
        bufferSize: 0,
        maxBufferSize: maxBufferBytes,
        totalSamples: 0,
        lastSpeechTimestamp: Date.now(),
        isSpeaking: false,
        silenceTimer: null,
      };

      activeRoom.audioBuffers.set(participantId, buffer);
      let firstFrameSeen = false;
      let resampler: AudioResampler | null = null;

      for await (const frame of audioStream) {
        if (!this.activeRooms.has(activeRoom.livekitRoomName)) break;

        if (!firstFrameSeen) {
          firstFrameSeen = true;
          const sampleRate = frame.sampleRate ?? LIVEKIT_STREAM_SAMPLE_RATE;
          const channels = frame.channels ?? LIVEKIT_STREAM_CHANNELS;
          buffer.sampleRate = sampleRate;
          buffer.channels = channels;
          if (sampleRate !== WHISPER_SAMPLE_RATE) {
            resampler = new AudioResampler(sampleRate, WHISPER_SAMPLE_RATE, channels);
            buffer.sampleRate = WHISPER_SAMPLE_RATE;
          }
          this.logger.debug(
            `Первый кадр: ${participantId} rate=${sampleRate} ch=${channels} resample=${!!resampler}`
          );
        }

        const framesToProcess = resampler ? resampler.push(frame) : [frame];

        for (const f of framesToProcess) {
          const pcmData = this.audioFrameToBuffer(f);
          if (!pcmData || pcmData.length === 0) continue;

          const rms = this.calculateRMS(pcmData);

          if (rms > VAD_THRESHOLD) {
            buffer.isSpeaking = true;
            buffer.lastSpeechTimestamp = Date.now();
            if (buffer.silenceTimer) {
              clearTimeout(buffer.silenceTimer);
              buffer.silenceTimer = null;
            }
          }

          if (buffer.isSpeaking) {
            if (buffer.bufferSize + pcmData.length <= buffer.maxBufferSize) {
              pcmData.copy(buffer.audioBuffer, buffer.bufferSize);
              buffer.bufferSize += pcmData.length;
              buffer.totalSamples += pcmData.length / 2;
            } else {
              this.logger.warn(`Буфер переполнен (${buffer.participantName}), сброс`);
              await this.flushBuffer(buffer, activeRoom);
              pcmData.copy(buffer.audioBuffer, buffer.bufferSize);
              buffer.bufferSize += pcmData.length;
              buffer.totalSamples += pcmData.length / 2;
            }

            const durationMs = (buffer.totalSamples / buffer.channels / buffer.sampleRate) * 1000;
            if (durationMs >= MAX_BUFFER_DURATION_MS) {
              await this.flushBuffer(buffer, activeRoom);
            }

            if (rms <= VAD_THRESHOLD && !buffer.silenceTimer) {
              buffer.silenceTimer = setTimeout(() => {
                void this.flushBuffer(buffer, activeRoom).catch((e) =>
                  this.logger.error(`Flush по тишине (${buffer.participantName}): ${e}`)
                );
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

        const scaled = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        const int16 = Math.max(-32768, Math.min(32767, Math.round(scaled)));
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
    // Очищаем таймер
    if (buffer.silenceTimer) {
      clearTimeout(buffer.silenceTimer);
      buffer.silenceTimer = null;
    }

    const durationMs = (buffer.totalSamples / buffer.channels / buffer.sampleRate) * 1000;
    if (durationMs < MIN_BUFFER_DURATION_MS || buffer.bufferSize === 0) {
      this.logger.debug(
        `Пропуск flush: ${buffer.participantName}, ${durationMs.toFixed(0)}ms < ${MIN_BUFFER_DURATION_MS}ms или пусто`
      );
      buffer.bufferSize = 0;
      buffer.totalSamples = 0;
      buffer.isSpeaking = false;
      return;
    }

    // Получаем аудио данные из буфера (только заполненную часть).
    // ВАЖНО: Buffer.slice() возвращает VIEW с общим underlying memory. Цикл for-await
    // продолжает писать в buffer.audioBuffer (после сброса bufferSize). Поэтому копируем
    // данные СРАЗУ — иначе save/transcribe получат повреждённые данные.
    const combinedBuffer = Buffer.from(buffer.audioBuffer.subarray(0, buffer.bufferSize));
    const startOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000 - durationMs / 1000;
    const endOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000;

    // Очищаем буфер
    buffer.bufferSize = 0;
    buffer.totalSamples = 0;
    buffer.isSpeaking = false;

    // Нормализация: стерео→моно для Whisper
    let outChannels = buffer.channels;
    const pcmForOutput = this.preparePcmForWhisper(combinedBuffer, buffer.channels);
    if (buffer.channels > 1) outChannels = 1;

    try {
      this.logger.debug(
        `Whisper: ${buffer.participantName}, ${durationMs.toFixed(0)}ms, ${pcmForOutput.length} байт PCM`
      );

      const text = await this.whisperSttService.transcribe(
        pcmForOutput,
        buffer.sampleRate,
        undefined,
        outChannels
      );

      if (text && text.trim().length > 0) {
        const trimmedText = text.trim();
        await this.transcriptionService.addSegment({
          transcriptionId: activeRoom.transcriptionId,
          speakerIdentity: buffer.participantIdentity,
          speakerName: buffer.participantName,
          text: trimmedText,
          startOffset: Math.max(0, startOffset),
          endOffset: endOffset,
        });
      } else {
        this.logger.warn(`Пустой результат Whisper для ${buffer.participantName}`);
      }
    } catch (error) {
      this.logger.error(`Ошибка распознавания (${buffer.participantIdentity}): ${error}`);
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
}
