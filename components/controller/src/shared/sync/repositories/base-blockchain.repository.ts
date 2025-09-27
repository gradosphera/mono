import { Injectable } from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';
import type { IBlockchainSyncRepository, IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { IBaseDatabaseData } from '../interfaces/base-database.interface';

/**
 * Базовый абстрактный класс для репозиториев блокчейн-сущностей
 *
 * Предоставляет общую реализацию методов:
 * - Синхронизации с блокчейном: findByBlockchainId, findByBlockNumGreaterThan, createIfNotExists, deleteByBlockNumGreaterThan
 * - CRUD операций: findAll, findById, save, update, delete
 */
@Injectable()
export abstract class BaseBlockchainRepository<
  TDomainEntity extends IBlockchainSynchronizable,
  TTypeormEntity extends IBaseDatabaseData
> implements IBlockchainSyncRepository<TDomainEntity>
{
  protected constructor(protected readonly repository: Repository<TTypeormEntity>) {}

  /**
   * Маппер для преобразования между доменной и TypeORM сущностями
   * Должен содержать методы:
   * - toDomain(typeormEntity: TTypeormEntity): TDomainEntity
   * - toEntity(domainEntity: TDomainEntity): Partial<TTypeormEntity>
   */
  protected abstract getMapper(): {
    toDomain: (typeormEntity: TTypeormEntity) => TDomainEntity;
    toEntity: (domainEntity: TDomainEntity) => Partial<TTypeormEntity>;
  };

  /**
   * Найти сущность по кастомному ключу синхронизации
   */
  async findBySyncKey(syncKey: string, syncValue: string): Promise<TDomainEntity | null> {
    const whereCondition = { [syncKey]: syncValue.toLowerCase() } as any;
    const entity = await this.repository.findOne({
      where: whereCondition,
    });

    return entity ? this.getMapper().toDomain(entity) : null;
  }

  /**
   * Найти сущности с номером блока больше указанного
   */
  async findByBlockNumGreaterThan(blockNum: number): Promise<TDomainEntity[]> {
    const entities = await this.repository.find({
      where: { block_num: MoreThan(blockNum) } as any,
    });

    return entities.map((entity) => this.getMapper().toDomain(entity));
  }

  /**
   * Создать сущность если не существует
   * Используется для синхронизации данных из блокчейна
   */
  async createIfNotExists(blockchainData: any, blockNum: number, present = true): Promise<TDomainEntity> {
    // Получаем ключ синхронизации из доменной сущности
    const syncKey = this.getSyncKey();
    const syncValue = this.extractSyncValueFromBlockchainData(blockchainData, syncKey);

    // Проверяем, существует ли уже по кастомному ключу
    const existing = await this.findBySyncKey(syncKey, syncValue);
    if (existing) {
      // Обновляем существующую сущность
      existing.updateFromBlockchain(blockchainData, blockNum, present);
      return await this.save(existing);
    } else {
      // Создаем новую сущность
      const now = new Date();
      const minimalDatabaseData: IBaseDatabaseData = {
        _id: '',
        block_num: blockNum,
        present: present,
        _created_at: now,
        _updated_at: now,
        [syncKey]: syncValue.toLowerCase(), // ключ синхронизации
      };

      const newEntity = this.createDomainEntity(minimalDatabaseData, blockchainData);
      return await this.save(newEntity);
    }
  }

  /**
   * Удалить сущности с номером блока больше указанного (для обработки форков)
   */
  async deleteByBlockNumGreaterThan(blockNum: number): Promise<void> {
    await this.repository.delete({
      block_num: MoreThan(blockNum),
    } as any);
  }

  /**
   * Обновить сущность
   */
  async update(entity: TDomainEntity): Promise<TDomainEntity> {
    const typeormEntity = this.getMapper().toEntity(entity);
    const savedEntity = await this.repository.save(typeormEntity as TTypeormEntity);
    return this.getMapper().toDomain(savedEntity);
  }

  /**
   * Сохранить сущность
   */
  async save(entity: TDomainEntity): Promise<TDomainEntity> {
    const typeormEntity = this.getMapper().toEntity(entity);
    const savedEntity = await this.repository.save(typeormEntity as TTypeormEntity);
    return this.getMapper().toDomain(savedEntity);
  }

  /**
   * Найти все сущности
   */
  async findAll(): Promise<TDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.getMapper().toDomain(entity));
  }

  /**
   * Найти сущность по внутреннему ID базы данных
   */
  async findById(_id: string): Promise<TDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { _id } as any,
    });

    return entity ? this.getMapper().toDomain(entity) : null;
  }

  /**
   * Удалить сущность по внутреннему ID базы данных
   */
  async delete(_id: string): Promise<void> {
    await this.repository.delete(_id);
  }

  /**
   * Создать доменную сущность
   * Должен быть реализован в наследниках для создания конкретного типа сущности
   */
  protected abstract createDomainEntity(databaseData: any, blockchainData: any): TDomainEntity;

  /**
   * Получить ключ синхронизации для данной сущности
   * Должен быть реализован в наследниках для возврата правильного ключа
   */
  protected abstract getSyncKey(): string;

  /**
   * Извлечь значение ключа синхронизации из блокчейн данных
   */
  protected extractSyncValueFromBlockchainData(blockchainData: any, syncKey: string): string {
    const value = blockchainData[syncKey];
    if (value === null || value === undefined) {
      throw new Error(`Sync key '${syncKey}' not found in blockchain data`);
    }
    return value.toString().toLowerCase();
  }
}
