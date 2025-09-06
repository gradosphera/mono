import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommitRepository } from '../../domain/repositories/commit.repository';
import { CommitDomainEntity } from '../../domain/entities/commit.entity';
import { CommitTypeormEntity } from '../entities/commit.typeorm-entity';
import { CommitMapper } from '../mappers/commit.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { ICommitBlockchainData } from '../../domain/interfaces/commit-blockchain.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';

@Injectable()
export class CommitTypeormRepository
  extends BaseBlockchainRepository<CommitDomainEntity, CommitTypeormEntity>
  implements CommitRepository, IBlockchainSyncRepository<CommitDomainEntity>
{
  constructor(
    @InjectRepository(CommitTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<CommitTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: CommitMapper.toDomain,
      toEntity: CommitMapper.toEntity,
    };
  }

  protected createDomainEntity(
    databaseData: { id: string; blockchain_id: string; block_num: number; present: boolean },
    blockchainData: ICommitBlockchainData
  ): CommitDomainEntity {
    return new CommitDomainEntity(databaseData, blockchainData);
  }

  // Специфичные методы для CommitRepository

  async create(commit: Omit<CommitDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommitDomainEntity> {
    const entity = this.repository.create(CommitMapper.toEntity(commit));
    const savedEntity = await this.repository.save(entity);
    return CommitMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<CommitDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CommitMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByUsername(username: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<CommitDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => CommitMapper.toDomain(entity));
  }

  /**
   * Обновление коммита в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: CommitDomainEntity): Promise<CommitDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = CommitMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Commit with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return CommitMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
