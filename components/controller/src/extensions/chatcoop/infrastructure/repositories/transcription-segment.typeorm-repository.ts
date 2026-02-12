import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranscriptionSegmentRepository } from '../../domain/repositories/transcription-segment.repository';
import { TranscriptionSegmentDomainEntity } from '../../domain/entities/transcription-segment.entity';
import { TranscriptionSegmentTypeormEntity } from '../entities/transcription-segment.typeorm-entity';
import { TranscriptionSegmentMapper } from '../mappers/transcription-segment.mapper';
import { CHATCOOP_CONNECTION_NAME } from '../database/chatcoop-database.constants';

// TypeORM адаптер репозитория сегментов транскрипции
@Injectable()
export class TranscriptionSegmentTypeormRepository implements TranscriptionSegmentRepository {
  constructor(
    @InjectRepository(TranscriptionSegmentTypeormEntity, CHATCOOP_CONNECTION_NAME)
    private readonly repository: Repository<TranscriptionSegmentTypeormEntity>
  ) {}

  async create(
    data: Omit<TranscriptionSegmentDomainEntity, 'id' | 'createdAt'>
  ): Promise<TranscriptionSegmentDomainEntity> {
    const entity = this.repository.create(TranscriptionSegmentMapper.toEntity(data));
    const savedEntity = await this.repository.save(entity);
    return TranscriptionSegmentMapper.toDomain(savedEntity);
  }

  async findByTranscriptionId(transcriptionId: string): Promise<TranscriptionSegmentDomainEntity[]> {
    const entities = await this.repository.find({
      where: { transcriptionId },
      order: { startOffset: 'ASC' },
    });
    return entities.map(TranscriptionSegmentMapper.toDomain);
  }

  async findById(id: string): Promise<TranscriptionSegmentDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? TranscriptionSegmentMapper.toDomain(entity) : null;
  }

  async createMany(
    data: Omit<TranscriptionSegmentDomainEntity, 'id' | 'createdAt'>[]
  ): Promise<TranscriptionSegmentDomainEntity[]> {
    const entities = data.map((d) => this.repository.create(TranscriptionSegmentMapper.toEntity(d)));
    const savedEntities = await this.repository.save(entities);
    return savedEntities.map(TranscriptionSegmentMapper.toDomain);
  }
}
