import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { WhisperSttService } from './whisper-stt.service';
import { TranscriptionManagementService } from '../../domain/services/transcription-management.service';
import { MatrixApiService } from './matrix-api.service';
import config from '~/config/config';
import { Room, RoomEvent, TrackKind, AudioStream } from '@livekit/rtc-node';
import { AccessToken } from 'livekit-server-sdk';

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
  buffers: Buffer[];
  totalSamples: number;
  lastSpeechTimestamp: number;
  isSpeaking: boolean;
  silenceTimer: ReturnType<typeof setTimeout> | null;
}

// Информация об активной комнате
interface ActiveRoom {
  room: unknown; // Room из @livekit/rtc-node (тип unknown для компиляции без пакета)
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
      const token = new AccessToken(config.livekit.api_key, config.livekit.api_secret, {
        identity: `secretary-agent`,
        name: 'Секретарь',
      });
      token.addGrant({
        roomJoin: true,
        room: livekitRoomName,
        canSubscribe: true,
        canPublish: false, // Секретарь только слушает
        hidden: true, // Скрытый участник
      });
      const jwt = await token.toJwt();

      // 2. Создаем запись транскрипции в БД
      const transcription = await this.transcriptionService.createTranscription({
        roomId: livekitRoomName,
        matrixRoomId: matrixRoomId,
        roomName: roomDisplayName,
      });

      // 3. Подключаемся к комнате
      const room = new Room();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await room.connect(config.livekit!.url!, jwt);

      const activeRoom: ActiveRoom = {
        room,
        transcriptionId: transcription.id,
        matrixRoomId: matrixRoomId,
        startedAt: new Date(),
        audioBuffers: new Map(),
      };

      this.activeRooms.set(livekitRoomName, activeRoom);

      // 4. Подписка на события комнаты
      room.on(RoomEvent.TrackSubscribed, (track: any, _publication: any, participant: any) => {
        if (track.kind === TrackKind.KIND_AUDIO) {
          this.logger.log(
            `Подписка на аудио-трек участника: ${participant.identity} (${participant.name || 'unknown'})`
          );
          this.processParticipantAudio(track, participant, activeRoom);
        }
      });

      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        this.logger.log(`Участник присоединился: ${participant.identity} (${participant.name || 'unknown'})`);
        this.transcriptionService.addParticipant(transcription.id, participant.identity);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: any) => {
        this.logger.log(`Участник отключился: ${participant.identity}`);
        // Сбрасываем буфер при отключении
        const buffer = activeRoom.audioBuffers.get(participant.identity);
        if (buffer) {
          this.flushBuffer(buffer, activeRoom);
          activeRoom.audioBuffers.delete(participant.identity);
        }
      });

      // Добавляем уже присутствующих участников
      for (const [, participant] of room.remoteParticipants) {
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
   * AudioStream -> VAD -> Buffer -> Whisper -> Store segment
   */
  private async processParticipantAudio(
    track: any,
    participant: any,
    activeRoom: ActiveRoom
  ): Promise<void> {
    try {
      const audioStream = new AudioStream(track, SAMPLE_RATE, 1);
      const participantId = participant.identity;

      // Инициализируем буфер для участника
      const buffer: ParticipantAudioBuffer = {
        participantIdentity: participantId,
        participantName: participant.name || participantId,
        buffers: [],
        totalSamples: 0,
        lastSpeechTimestamp: Date.now(),
        isSpeaking: false,
        silenceTimer: null,
      };

      activeRoom.audioBuffers.set(participantId, buffer);

      // Обрабатываем кадры аудио
      for await (const frame of audioStream) {
        // Проверяем, что комната ещё активна
        if (!this.activeRooms.has(activeRoom.room as any)) break;

        const pcmData = Buffer.from(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);

        // VAD: вычисляем RMS (среднеквадратичное значение) для определения речи
        const rms = this.calculateRMS(pcmData);

        if (rms > VAD_THRESHOLD) {
          // Речь обнаружена
          buffer.isSpeaking = true;
          buffer.lastSpeechTimestamp = Date.now();
          buffer.buffers.push(pcmData);
          buffer.totalSamples += pcmData.length / 2; // 16-bit = 2 bytes per sample

          // Сбрасываем таймер тишины
          if (buffer.silenceTimer) {
            clearTimeout(buffer.silenceTimer);
            buffer.silenceTimer = null;
          }

          // Проверяем максимальную длительность буфера
          const durationMs = (buffer.totalSamples / SAMPLE_RATE) * 1000;
          if (durationMs >= MAX_BUFFER_DURATION_MS) {
            await this.flushBuffer(buffer, activeRoom);
          }
        } else if (buffer.isSpeaking) {
          // Тишина после речи -- запускаем таймер для сброса буфера
          if (!buffer.silenceTimer) {
            buffer.silenceTimer = setTimeout(async () => {
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
    // Очищаем таймер
    if (buffer.silenceTimer) {
      clearTimeout(buffer.silenceTimer);
      buffer.silenceTimer = null;
    }

    // Проверяем минимальную длительность
    const durationMs = (buffer.totalSamples / SAMPLE_RATE) * 1000;
    if (durationMs < MIN_BUFFER_DURATION_MS || buffer.buffers.length === 0) {
      buffer.buffers = [];
      buffer.totalSamples = 0;
      buffer.isSpeaking = false;
      return;
    }

    // Объединяем буферы
    const combinedBuffer = Buffer.concat(buffer.buffers);
    const startOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000 - durationMs / 1000;
    const endOffset = (Date.now() - activeRoom.startedAt.getTime()) / 1000;

    // Очищаем буфер
    buffer.buffers = [];
    buffer.totalSamples = 0;
    buffer.isSpeaking = false;

    try {
      // Отправляем на распознавание
      const text = await this.whisperSttService.transcribe(combinedBuffer, SAMPLE_RATE);

      if (text && text.trim().length > 0) {
        // Сохраняем сегмент транскрипции
        await this.transcriptionService.addSegment({
          transcriptionId: activeRoom.transcriptionId,
          speakerIdentity: buffer.participantIdentity,
          speakerName: buffer.participantName,
          text: text.trim(),
          startOffset: Math.max(0, startOffset),
          endOffset: endOffset,
        });
      }
    } catch (error) {
      this.logger.error(
        `Ошибка распознавания речи участника ${buffer.participantIdentity}: ${error}`
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
}
