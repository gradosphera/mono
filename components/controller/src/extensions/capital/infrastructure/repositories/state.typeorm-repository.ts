import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { StateRepository } from '../../domain/repositories/state.repository';
import { StateDomainEntity } from '../../domain/entities/state.entity';
import { StateTypeormEntity } from '../entities/state.typeorm-entity';
import { StateMapper } from '../mappers/state.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IStateBlockchainData } from '../../domain/interfaces/state-blockchain.interface';

@Injectable()
export class StateTypeormRepository implements StateRepository, IBlockchainSyncRepository<StateDomainEntity> {
  constructor(
    @InjectRepository(StateTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<StateTypeormEntity>
  ) {}

  async create(state: Omit<StateDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<StateDomainEntity> {
    const entity = this.repository.create(StateMapper.toEntity(state));
    const savedEntity = await this.repository.save(entity);
    return StateMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<StateDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? StateMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<StateDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => StateMapper.toDomain(entity));
  }

  async findByCoopname(coopname: string): Promise<StateDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { coopname } });
    return entity ? StateMapper.toDomain(entity) : null;
  }

  /**
   * Обновление состояния в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: StateDomainEntity): Promise<StateDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = StateMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`State with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return StateMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти состояние по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<StateDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? StateMapper.toDomain(entity) : null;
  }

  /**
   * Найти состояния с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<StateDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => StateMapper.toDomain(entity));
  }

  /**
   * Создать состояние если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(
    blockchainData: IStateBlockchainData,
    blockNum: number,
    present = true
  ): Promise<StateDomainEntity> {
    const blockchainId = blockchainData.coopname;

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
    const tempDomainEntity = new StateDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(StateMapper.toEntity(tempDomainEntity));
    entity.blockchain_id = blockchainId; // Устанавливаем ID блокчейна
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return StateMapper.toDomain(savedEntity);
  }

  /**
   * Удалить состояния с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
