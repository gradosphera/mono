import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { WhisperSttService } from './whisper-stt.service';
import { TranscriptionManagementService } from '../../domain/services/transcription-management.service';
import { MatrixApiService } from './matrix-api.service';
import config from '~/config/config';
import { Room, RoomEvent, TrackKind, AudioStream } from '@livekit/rtc-node';
import { AccessToken } from 'livekit-server-sdk';
import { promises as fs } from 'fs';
import Resampler from "audio-resampler";

// Параметры VAD (Voice Activity Detection)
const VAD_THRESHOLD = 0.01; // RMS порог для определения речи
const SILENCE_TIMEOUT_MS = 800; // Таймаут тишины для сброса буфера (мс)
const MIN_BUFFER_DURATION_MS = 500; // Минимальная длительность буфера для отправки на распознавание
const MAX_BUFFER_DURATION_MS = 30000; // Максимальная длительность буфера (30 сек)
const SAMPLE_RATE = 48000; // Частота дискретизации LiveKit

// Буфер аудио для одного участника
interface ParticipantAudioBuffer {
  participantIdentity: string;
  participantName: string;
  sampleRate: number;
  audioBuffer: Buffer; // Единый буфер вместо массива буферов
  bufferSize: number; // Текущий размер буфера в байтах
  maxBufferSize: number; // Максимальный размер буфера
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
@Injectable()
export class SecretaryAgentService implements OnModuleDestroy {
  private readonly logger = new Logger(SecretaryAgentService.name);
  private activeRooms = new Map<string, ActiveRoom>();

  constructor(
    private readonly whisperSttService: WhisperSttService,
    private readonly transcriptionService: TranscriptionManagementService,
    private readonly matrixApiService: MatrixApiService
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
        this.logger.log(`🎤 ТРЕК ПОДПИСАН: ${track.kind} от ${participant.identity} - remote=${participant !== room.localParticipant}`);
        if (track.kind === TrackKind.KIND_AUDIO) {
          this.logger.log(`🎧 АУДИО-ТРЕК ПОДПИСАН! Начинаем обработку...`);
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

      // 5. Отправляем сообщение в Matrix-чат о подключении секретаря
      try {
        await this.matrixApiService.sendMessage(
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
   * AudioStream -> Resample(48k->16k) -> VAD -> Buffer -> Whisper -> Store segment
   */
  private async processParticipantAudio(
    track: any,
    participant: any,
    activeRoom: ActiveRoom
  ): Promise<void> {
    try {
      this.logger.log(`🎧 Начинаю обработку аудио-потока: ${participant.name || participant.identity}`);
      const audioStream = new AudioStream(track, SAMPLE_RATE, 1);
      const participantId = participant.identity;

      // Инициализируем буфер для участника
      // Выделяем большой буфер заранее (30 сек * 48000 Hz * 2 байта = ~2.8MB)
      const maxBufferBytes = MAX_BUFFER_DURATION_MS / 1000 * SAMPLE_RATE * 2; // 16-bit = 2 bytes per sample
      const buffer: ParticipantAudioBuffer = {
        participantIdentity: participantId,
        participantName: participant.name || participantId,
        sampleRate: SAMPLE_RATE,
        audioBuffer: Buffer.alloc(maxBufferBytes),
        bufferSize: 0,
        maxBufferSize: maxBufferBytes,
        totalSamples: 0,
        lastSpeechTimestamp: Date.now(),
        isSpeaking: false,
        silenceTimer: null,
      };

      activeRoom.audioBuffers.set(participantId, buffer);

      let firstFrameLogged = false;

      // Обрабатываем кадры аудио
      for await (const frame of audioStream) {
        // Проверяем, что комната ещё активна
        if (!this.activeRooms.has(activeRoom.livekitRoomName)) break;

        // Логируем первый фрейм для диагностики формата
        if (!firstFrameLogged) {
          this.logger.log(
            `🔍 ПЕРВЫЙ ФРЕЙМ [${buffer.participantName}]: sampleRate=${frame.sampleRate}, samplesPerChannel=${frame.samplesPerChannel}, dataLength=${frame.data.length}`
          );
          this.logger.log(
            `FRAME TYPE: ${frame.data.constructor.name}`
          );

          // Сохраняем сырые данные первого фрейма для отладки
          const rawDebugPath = `/app/tmp/debug_raw_${buffer.participantIdentity}_${Date.now()}.raw`;
          await fs.writeFile(rawDebugPath, Buffer.from(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength));
          this.logger.log(`🔊 Сырые данные сохранены: ${rawDebugPath} (${frame.data.byteLength} байт)`);

          firstFrameLogged = true;
        }

        // Фиксируем реальный sampleRate из фрейма (AudioStream должен ресэмплить, но подстрахуемся)
        if (frame.sampleRate && frame.sampleRate !== buffer.sampleRate) {
          this.logger.warn(`⚠️ sampleRate в фрейме (${frame.sampleRate}) отличается от ожидаемого (${buffer.sampleRate}), обновляем`);
          buffer.sampleRate = frame.sampleRate;
        }

        // Ресэмплируем аудио с 48000Hz до 16000Hz для Whisper
        const int16 = frame.data as Int16Array;
        const resampler = new Resampler({
          fromSampleRate: buffer.sampleRate,
          toSampleRate: 16000,
          channels: 1
        });
        const resampledSamples = resampler.resample(int16);

        // Конвертируем результирующий массив в Buffer
        const pcmData = Buffer.allocUnsafe(resampledSamples.length * 2);
        for (let i = 0; i < resampledSamples.length; i++) {
          pcmData.writeInt16LE(resampledSamples[i], i * 2);
        }

        // Обновляем sampleRate буфера после ресэмплинга (все последующие данные будут в 16000Hz)
        buffer.sampleRate = 16000;

        // VAD: вычисляем RMS (среднеквадратичное значение) для определения речи
        const rms = this.calculateRMS(pcmData);

        if (rms > VAD_THRESHOLD) {
          // Речь обнаружена
          if (!buffer.isSpeaking) {
            this.logger.log(`🗣️  РЕЧЬ ОБНАРУЖЕНА: ${buffer.participantName} (RMS: ${rms.toFixed(3)})`);
          }
          buffer.isSpeaking = true;
          buffer.lastSpeechTimestamp = Date.now();

          // Копируем данные в единый буфер вместо добавления в массив
          if (buffer.bufferSize + pcmData.length <= buffer.maxBufferSize) {
            pcmData.copy(buffer.audioBuffer, buffer.bufferSize);
            buffer.bufferSize += pcmData.length;
            buffer.totalSamples += pcmData.length / 2; // 16-bit = 2 bytes per sample
          } else {
            this.logger.warn(`⚠️ Буфер переполнен для ${buffer.participantName}, сбрасываем`);
            await this.flushBuffer(buffer, activeRoom);
            // После сброса копируем текущий фрейм
            pcmData.copy(buffer.audioBuffer, buffer.bufferSize);
            buffer.bufferSize += pcmData.length;
            buffer.totalSamples += pcmData.length / 2;
          }

          // Сбрасываем таймер тишины
          if (buffer.silenceTimer) {
            clearTimeout(buffer.silenceTimer);
            buffer.silenceTimer = null;
          }

          // Проверяем максимальную длительность буфера
          const durationMs = (buffer.totalSamples / SAMPLE_RATE) * 1000;
          if (durationMs >= MAX_BUFFER_DURATION_MS) {
            this.logger.log(`⏰ Максимальная длительность буфера достигнута: ${buffer.participantName}`);
            await this.flushBuffer(buffer, activeRoom);
          }
        } else if (buffer.isSpeaking) {
          // Тишина после речи -- запускаем таймер для сброса буфера
          if (!buffer.silenceTimer) {
            buffer.silenceTimer = setTimeout(async () => {
              this.logger.log(`⏳ Таймер тишины сработал: ${buffer.participantName}`);
              await this.flushBuffer(buffer, activeRoom);
            }, SILENCE_TIMEOUT_MS);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Ошибка обработки аудио участника ${participant.identity}: ${error}`);
    }
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

    // Очищаем таймер
    if (buffer.silenceTimer) {
      clearTimeout(buffer.silenceTimer);
      buffer.silenceTimer = null;
    }

    // Проверяем минимальную длительность
    const durationMs = (buffer.totalSamples / buffer.sampleRate) * 1000;
    if (durationMs < MIN_BUFFER_DURATION_MS || buffer.bufferSize === 0) {
      this.logger.log(`⚠️  Буфер слишком короткий: ${durationMs.toFixed(1)}ms < ${MIN_BUFFER_DURATION_MS}ms`);
      buffer.bufferSize = 0;
      buffer.totalSamples = 0;
      buffer.isSpeaking = false;
      return;
    }

    // Получаем аудио данные из буфера (только заполненную часть)
    const combinedBuffer = buffer.audioBuffer.slice(0, buffer.bufferSize);
    const startOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000 - durationMs / 1000;
    const endOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000;

    // Очищаем буфер
    buffer.bufferSize = 0;
    buffer.totalSamples = 0;
    buffer.isSpeaking = false;

    try {
      this.logger.log(
        `Отправляем на распознавание аудио участника ${buffer.participantName} (${durationMs.toFixed(1)}ms)`
      );

      // ОТЛАДКА: Сохраняем аудио-файл на диск перед отправкой в Whisper
      const debugAudioPath = `/app/tmp/debug_audio_${buffer.participantIdentity}_${Date.now()}.wav`;
      await this.saveAudioBufferAsWav(combinedBuffer, buffer.sampleRate, debugAudioPath);
      this.logger.log(`🔊 Аудио сохранено для отладки: ${debugAudioPath} (${combinedBuffer.length} байт PCM = ${(combinedBuffer.length / 2 / buffer.sampleRate).toFixed(1)} сек, ${buffer.sampleRate}Hz, 16-bit mono)`);

      // Отправляем на распознавание
      const text = await this.whisperSttService.transcribe(combinedBuffer, buffer.sampleRate);

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

      // Отправляем сообщение в Matrix-чат об отключении секретаря
      try {
        await this.matrixApiService.sendMessage(
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
  private async saveAudioBufferAsWav(pcmBuffer: Buffer, sampleRate: number, filePath: string): Promise<void> {
    try {
      // Создаем WAV заголовок
      const wavHeader = this.createWavHeader(pcmBuffer.length, sampleRate);

      // Объединяем заголовок и PCM данные
      const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

      // Сохраняем файл
      await fs.writeFile(filePath, wavBuffer);
      this.logger.log(`✅ WAV файл сохранен: ${filePath} (${wavBuffer.length} байт)`);
    } catch (error) {
      this.logger.error(`❌ Ошибка сохранения WAV файла ${filePath}: ${error}`);
    }
  }

  /**
   * Создает WAV заголовок для PCM данных
   */
  private createWavHeader(dataLength: number, sampleRate: number): Buffer {
    const header = Buffer.alloc(44);

    // RIFF chunk descriptor
    header.write('RIFF', 0); // ChunkID
    header.writeUInt32LE(36 + dataLength, 4); // ChunkSize (36 + dataLength)
    header.write('WAVE', 8); // Format

    // fmt subchunk
    header.write('fmt ', 12); // Subchunk1ID
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 для PCM)
    header.writeUInt16LE(1, 20); // AudioFormat (1 для PCM)
    header.writeUInt16LE(1, 22); // NumChannels (1 для моно)
    header.writeUInt32LE(sampleRate, 24); // SampleRate
    header.writeUInt32LE(sampleRate * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    header.writeUInt16LE(2, 32); // BlockAlign (NumChannels * BitsPerSample/8)
    header.writeUInt16LE(16, 34); // BitsPerSample

    // data subchunk
    header.write('data', 36); // Subchunk2ID
    header.writeUInt32LE(dataLength, 40); // Subchunk2Size

    return header;
  }
}
