import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtDomainEntity } from '../../domain/entities/debt.entity';
import { DebtTypeormEntity } from '../entities/debt.typeorm-entity';
import { DebtMapper } from '../mappers/debt.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IDebtBlockchainData } from '../../domain/interfaces/debt-blockchain.interface';

@Injectable()
export class DebtTypeormRepository implements DebtRepository, IBlockchainSyncRepository<DebtDomainEntity> {
  constructor(
    @InjectRepository(DebtTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<DebtTypeormEntity>
  ) {}

  async create(debt: Omit<DebtDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DebtDomainEntity> {
    const entity = this.repository.create(DebtMapper.toEntity(debt));
    const savedEntity = await this.repository.save(entity);
    return DebtMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<DebtDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? DebtMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<DebtDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => DebtMapper.toDomain(entity));
  }

  async findByUsername(username: string): Promise<DebtDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => DebtMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<DebtDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => DebtMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<DebtDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => DebtMapper.toDomain(entity));
  }

  /**
   * Обновление долга в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: DebtDomainEntity): Promise<DebtDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = DebtMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Debt with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return DebtMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти долг по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<DebtDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? DebtMapper.toDomain(entity) : null;
  }

  /**
   * Найти долги с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<DebtDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => DebtMapper.toDomain(entity));
  }

  /**
   * Создать долг если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(blockchainData: IDebtBlockchainData, blockNum: number, present = true): Promise<DebtDomainEntity> {
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
    const tempDomainEntity = new DebtDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(DebtMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return DebtMapper.toDomain(savedEntity);
  }

  /**
   * Удалить долги с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
