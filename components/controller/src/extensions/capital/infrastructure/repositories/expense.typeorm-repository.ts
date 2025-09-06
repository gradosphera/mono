import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';
import { ExpenseDomainEntity } from '../../domain/entities/expense.entity';
import { ExpenseTypeormEntity } from '../entities/expense.typeorm-entity';
import { ExpenseMapper } from '../mappers/expense.mapper';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';
import type { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import type { IExpenseBlockchainData } from '../../domain/interfaces/expense-blockchain.interface';

@Injectable()
export class ExpenseTypeormRepository implements ExpenseRepository, IBlockchainSyncRepository<ExpenseDomainEntity> {
  constructor(
    @InjectRepository(ExpenseTypeormEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<ExpenseTypeormEntity>
  ) {}

  async create(expense: Omit<ExpenseDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseDomainEntity> {
    const entity = this.repository.create(ExpenseMapper.toEntity(expense));
    const savedEntity = await this.repository.save(entity);
    return ExpenseMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<ExpenseDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ExpenseMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  async findByUsername(username: string): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({ where: { username } });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  async findByProjectHash(projectHash: string): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({ where: { project_hash: projectHash } });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  async findByStatus(status: string): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  /**
   * Обновление расхода в базе данных
   * Принимает доменную сущность и обновляет соответствующие поля в TypeORM сущности
   */
  async update(entity: ExpenseDomainEntity): Promise<ExpenseDomainEntity> {
    // Преобразуем доменную сущность в данные для обновления
    const updateData = ExpenseMapper.toUpdateEntity(entity);

    // Обновляем запись в базе данных
    await this.repository.update(entity.id, updateData);

    // Получаем обновленную сущность из базы данных
    const updatedEntity = await this.repository.findOne({ where: { id: entity.id } });
    if (!updatedEntity) {
      throw new Error(`Expense with id ${entity.id} not found after update`);
    }

    // Возвращаем обновленную доменную сущность
    return ExpenseMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Методы для синхронизации блокчейна

  /**
   * Найти расход по ID блокчейна
   */
  async findByBlockchainId(blockchainId: string): Promise<ExpenseDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { blockchain_id: blockchainId },
    });
    return entity ? ExpenseMapper.toDomain(entity) : null;
  }

  /**
   * Найти расходы с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<ExpenseDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) },
    });
    return entities.map((entity) => ExpenseMapper.toDomain(entity));
  }

  /**
   * Создать расход если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(
    blockchainData: IExpenseBlockchainData,
    blockNum: number,
    present = true
  ): Promise<ExpenseDomainEntity> {
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
    const tempDomainEntity = new ExpenseDomainEntity(minimalDatabaseData, blockchainData);

    // Используем маппер для создания TypeORM сущности
    const entity = this.repository.create(ExpenseMapper.toEntity(tempDomainEntity));
    entity.block_num = blockNum; // Устанавливаем номер блока
    entity.present = present; // Устанавливаем статус существования

    const savedEntity = await this.repository.save(entity);

    return ExpenseMapper.toDomain(savedEntity);
  }

  /**
   * Удалить расходы с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    });
  }
}
