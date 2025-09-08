import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoteRepository } from '../../domain/repositories/vote.repository';
import { VoteDomainEntity } from '../../domain/entities/vote.entity';
import { VoteTypeormEntity } from '../entities/vote.typeorm-entity';
import { VoteMapper } from '../mappers/vote.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { BaseBlockchainRepository } from './base-blockchain.repository';
import type { IVoteDatabaseData } from '../../domain/interfaces/vote-database.interface';
import type { IVoteBlockchainData } from '../../domain/interfaces/vote-blockchain.interface';

@Injectable()
export class VoteTypeormRepository
  extends BaseBlockchainRepository<VoteDomainEntity, VoteTypeormEntity>
  implements VoteRepository, IBlockchainSyncRepository<VoteDomainEntity>
{
  constructor(
    @InjectRepository(VoteTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    repository: Repository<VoteTypeormEntity>
  ) {
    super(repository);
  }

  protected getMapper() {
    return {
      toDomain: VoteMapper.toDomain,
      toEntity: VoteMapper.toEntity,
    };
  }

  protected createDomainEntity(databaseData: IVoteDatabaseData, blockchainData: IVoteBlockchainData): VoteDomainEntity {
    return new VoteDomainEntity(databaseData, blockchainData);
  }

  protected getSyncKey(): string {
    return VoteDomainEntity.getSyncKey();
  }

  async create(vote: VoteDomainEntity): Promise<VoteDomainEntity> {
    const entity = this.repository.create(VoteMapper.toEntity(vote));
    const savedEntity = await this.repository.save(entity);
    return VoteMapper.toDomain(savedEntity);
  }

  async findByVoter(voter: string): Promise<VoteDomainEntity[]> {
    const entities = await this.repository.find({ where: { voter } });
    return entities.map((entity) => VoteMapper.toDomain(entity));
  }

  async findByRecipient(recipient: string): Promise<VoteDomainEntity[]> {
    const entities = await this.repository.find({ where: { recipient } });
    return entities.map((entity) => VoteMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<VoteDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => VoteMapper.toDomain(entity));
  }

  /**
   * Обновление голоса в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: VoteDomainEntity): Promise<VoteDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = VoteMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity._id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { _id: entity._id } });
    if (!updatedEntity) {
      throw new Error(`Vote with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return VoteMapper.toDomain(updatedEntity);
  }
}
