import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  CallTranscriptionRepository,
  CALL_TRANSCRIPTION_REPOSITORY,
} from '../repositories/call-transcription.repository';
import {
  TranscriptionSegmentRepository,
  TRANSCRIPTION_SEGMENT_REPOSITORY,
} from '../repositories/transcription-segment.repository';
import { CallTranscriptionDomainEntity, TranscriptionStatus } from '../entities/call-transcription.entity';
import { TranscriptionSegmentDomainEntity } from '../entities/transcription-segment.entity';

// Доменный сервис для управления транскрипциями звонков
@Injectable()
export class TranscriptionManagementService {
  private readonly logger = new Logger(TranscriptionManagementService.name);

  constructor(
    @Inject(CALL_TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepo: CallTranscriptionRepository,
    @Inject(TRANSCRIPTION_SEGMENT_REPOSITORY)
    private readonly segmentRepo: TranscriptionSegmentRepository
  ) {}

  /**
   * Создает новую запись транскрипции при начале звонка
   */
  async createTranscription(data: {
    roomId: string;
    matrixRoomId: string;
    roomName: string;
    participants?: string[];
  }): Promise<CallTranscriptionDomainEntity> {
    this.logger.log(`Создание транскрипции для комнаты ${data.roomId} (matrix: ${data.matrixRoomId})`);

    return this.transcriptionRepo.create({
      roomId: data.roomId,
      matrixRoomId: data.matrixRoomId,
      roomName: data.roomName,
      startedAt: new Date(),
      endedAt: null,
      participants: data.participants || [],
      status: TranscriptionStatus.ACTIVE,
    });
  }

  /**
   * Добавляет сегмент транскрипции (распознанный фрагмент речи)
   */
  async addSegment(data: {
    transcriptionId: string;
    speakerIdentity: string;
    speakerName: string;
    text: string;
    startOffset: number;
    endOffset: number;
  }): Promise<TranscriptionSegmentDomainEntity> {
    this.logger.log(
      `Добавление сегмента для транскрипции ${data.transcriptionId}: [${data.speakerName}] "${data.text.substring(0, 50)}..."`
    );

    return this.segmentRepo.create({
      transcriptionId: data.transcriptionId,
      speakerIdentity: data.speakerIdentity,
      speakerName: data.speakerName,
      text: data.text,
      startOffset: data.startOffset,
      endOffset: data.endOffset,
    });
  }

  /**
   * Добавляет участника в список участников транскрипции
   */
  async addParticipant(transcriptionId: string, participantIdentity: string): Promise<void> {
    const transcription = await this.transcriptionRepo.findById(transcriptionId);
    if (!transcription) {
      this.logger.warn(`Транскрипция ${transcriptionId} не найдена при добавлении участника`);
      return;
    }

    if (!transcription.participants.includes(participantIdentity)) {
      const updatedParticipants = [...transcription.participants, participantIdentity];
      await this.transcriptionRepo.update(transcriptionId, { participants: updatedParticipants });
      this.logger.log(`Участник ${participantIdentity} добавлен в транскрипцию ${transcriptionId}`);
    }
  }

  /**
   * Завершает транскрипцию (вызывается при окончании звонка)
   */
  async completeTranscription(id: string): Promise<CallTranscriptionDomainEntity> {
    this.logger.log(`Завершение транскрипции ${id}`);

    return this.transcriptionRepo.update(id, {
      status: TranscriptionStatus.COMPLETED,
      endedAt: new Date(),
    });
  }

  /**
   * Помечает транскрипцию как провалившуюся
   */
  async failTranscription(id: string): Promise<CallTranscriptionDomainEntity> {
    this.logger.warn(`Транскрипция ${id} помечена как провалившаяся`);

    return this.transcriptionRepo.update(id, {
      status: TranscriptionStatus.FAILED,
      endedAt: new Date(),
    });
  }

  /**
   * Получает список транскрипций по Matrix room ID
   */
  async getTranscriptionsByRoom(matrixRoomId: string): Promise<CallTranscriptionDomainEntity[]> {
    return this.transcriptionRepo.findByMatrixRoomId(matrixRoomId);
  }

  /**
   * Получает полную транскрипцию с сегментами
   */
  async getTranscriptionWithSegments(
    id: string
  ): Promise<{ transcription: CallTranscriptionDomainEntity; segments: TranscriptionSegmentDomainEntity[] } | null> {
    const transcription = await this.transcriptionRepo.findById(id);
    if (!transcription) return null;

    const segments = await this.segmentRepo.findByTranscriptionId(id);

    return { transcription, segments };
  }

  /**
   * Получает все транскрипции (с пагинацией)
   */
  async getAllTranscriptions(options?: {
    limit?: number;
    offset?: number;
  }): Promise<CallTranscriptionDomainEntity[]> {
    return this.transcriptionRepo.findAll(options);
  }

  /**
   * Получает транскрипции по идентификатору участника
   */
  async getTranscriptionsByParticipant(speakerIdentity: string): Promise<CallTranscriptionDomainEntity[]> {
    return this.transcriptionRepo.findByParticipant(speakerIdentity);
  }

  /**
   * Получает активную транскрипцию для комнаты
   */
  async getActiveTranscriptionByRoomId(roomId: string): Promise<CallTranscriptionDomainEntity | null> {
    return this.transcriptionRepo.findActiveByRoomId(roomId);
  }
}
