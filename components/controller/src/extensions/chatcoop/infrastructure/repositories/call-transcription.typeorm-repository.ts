import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallTranscriptionRepository } from '../../domain/repositories/call-transcription.repository';
import { CallTranscriptionDomainEntity, TranscriptionStatus } from '../../domain/entities/call-transcription.entity';
import { CallTranscriptionTypeormEntity } from '../entities/call-transcription.typeorm-entity';
import { CallTranscriptionMapper } from '../mappers/call-transcription.mapper';
import { CHATCOOP_CONNECTION_NAME } from '../database/chatcoop-database.constants';

// TypeORM адаптер репозитория транскрипций звонков
@Injectable()
export class CallTranscriptionTypeormRepository implements CallTranscriptionRepository {
  constructor(
    @InjectRepository(CallTranscriptionTypeormEntity, CHATCOOP_CONNECTION_NAME)
    private readonly repository: Repository<CallTranscriptionTypeormEntity>
  ) {}

  async create(
    data: Omit<CallTranscriptionDomainEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CallTranscriptionDomainEntity> {
    const entity = this.repository.create(CallTranscriptionMapper.toEntity(data));
    const savedEntity = await this.repository.save(entity);
    return CallTranscriptionMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<CallTranscriptionDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CallTranscriptionMapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: string): Promise<CallTranscriptionDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { roomId } });
    return entity ? CallTranscriptionMapper.toDomain(entity) : null;
  }

  async findByMatrixRoomId(matrixRoomId: string): Promise<CallTranscriptionDomainEntity[]> {
    const entities = await this.repository.find({
      where: { matrixRoomId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(CallTranscriptionMapper.toDomain);
  }

  async findActiveByRoomId(roomId: string): Promise<CallTranscriptionDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { roomId, status: TranscriptionStatus.ACTIVE },
    });
    return entity ? CallTranscriptionMapper.toDomain(entity) : null;
  }

  async update(id: string, data: Partial<CallTranscriptionDomainEntity>): Promise<CallTranscriptionDomainEntity> {
    const updateData = CallTranscriptionMapper.toUpdateEntity(data);
    await this.repository.update(id, updateData);

    const updatedEntity = await this.repository.findOne({ where: { id } });
    if (!updatedEntity) {
      throw new Error('Call transcription not found after update');
    }

    return CallTranscriptionMapper.toDomain(updatedEntity);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<CallTranscriptionDomainEntity[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
      take: options?.limit,
      skip: options?.offset,
    });
    return entities.map(CallTranscriptionMapper.toDomain);
  }

  async findByParticipant(speakerIdentity: string): Promise<CallTranscriptionDomainEntity[]> {
    // Поиск транскрипций, в которых участвовал конкретный пользователь
    const entities = await this.repository
      .createQueryBuilder('ct')
      .where('ct.participants @> :participant', { participant: JSON.stringify([speakerIdentity]) })
      .orderBy('ct.created_at', 'DESC')
      .getMany();

    return entities.map(CallTranscriptionMapper.toDomain);
  }
}
