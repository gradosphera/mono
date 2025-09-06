import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { InvestRepository } from '../../domain/repositories/invest.repository';
import { InvestDomainEntity } from '../../domain/entities/invest.entity';
import { InvestTypeormEntity } from '../entities/invest.typeorm-entity';
import { InvestMapper } from '../mappers/invest.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IInvestBlockchainData } from '../../domain/interfaces/invest-blockchain.interface';

@Injectable()
export class InvestTypeormRepository implements InvestRepository, IBlockchainSyncRepository<InvestDomainEntity> {
  constructor(
    @InjectRepository(InvestTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<InvestTypeormEntity>
  ) {}

  async create(invest: Omit<InvestDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvestDomainEntity> {
    const entity = this.repository.create(InvestMapper.toEntity(invest));
    const savedEntity = await this.repository.save(entity);
    return InvestMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<InvestDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? InvestMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  async findByUsername(username: string): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  /**
   * Обновление инвестиции в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: InvestDomainEntity): Promise<InvestDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = InvestMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Invest with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return InvestMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти инвестицию по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<InvestDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? InvestMapper.toDomain(entity) : null;
  }

  /**
   * Найти инвестиции с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<InvestDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => InvestMapper.toDomain(entity));
  }

  /**
   * Создать инвестицию если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(
    blockchainData: IInvestBlockchainData,
    blockNum: number,
    present = true
  ): Promise<InvestDomainEntity> {
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
    const tempDomainEntity = new InvestDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(InvestMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return InvestMapper.toDomain(savedEntity);
  }

  /**
   * Удалить инвестиции с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
