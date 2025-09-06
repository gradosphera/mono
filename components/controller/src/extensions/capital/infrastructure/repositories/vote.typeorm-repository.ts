import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { VoteRepository } from '../../domain/repositories/vote.repository';
import { VoteDomainEntity } from '../../domain/entities/vote.entity';
import { VoteTypeormEntity } from '../entities/vote.typeorm-entity';
import { VoteMapper } from '../mappers/vote.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IVoteBlockchainData } from '../../domain/interfaces/vote-blockchain.interface';

@Injectable()
export class VoteTypeormRepository implements VoteRepository, IBlockchainSyncRepository<VoteDomainEntity> {
  constructor(
    @InjectRepository(VoteTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<VoteTypeormEntity>
  ) {}

  async create(vote: Omit<VoteDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VoteDomainEntity> {
    const entity = this.repository.create(VoteMapper.toEntity(vote));
    const savedEntity = await this.repository.save(entity);
    return VoteMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<VoteDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? VoteMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<VoteDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => VoteMapper.toDomain(entity));
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
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Vote with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return VoteMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти голос по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<VoteDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? VoteMapper.toDomain(entity) : null;
  }

  /**
   * Найти голоса с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<VoteDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => VoteMapper.toDomain(entity));
  }

  /**
   * Создать голос если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(blockchainData: IVoteBlockchainData, blockNum: number, present = true): Promise<VoteDomainEntity> {
    const blockchainId = blockchainData.id.toString();

    // Проверяем, существует ли уже
    const existing = await this.findByBlockchainId(blockchainId);
    if (existing) {
      return existing;
    }

    // Создаем доменную сущность с минимальными данными для базы данных
    // Остальные данные будут храниться только в доменной сущности
    const minimalDatabaseData = {
      id: '', // Будет сгенерирован базой данных
      blockchain_id: blockchainId,
      block_num: blockNum,
      present: present,
    };

    // Создаем временную доменную сущность для использования в маппере
    const tempDomainEntity = new VoteDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(VoteMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return VoteMapper.toDomain(savedEntity);
  }

  /**
   * Удалить голоса с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
