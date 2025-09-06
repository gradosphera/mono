import type { IDelta } from '~/types/common';

/**
 * Интерфейс для данных с привязкой к блоку
 */
export interface IBlockchainSyncData {
  /** Номер блока в котором произошло изменение */
  block_num: number;
}

/**
 * Интерфейс для сущностей, которые могут быть синхронизированы с блокчейном
 */
export interface IBlockchainSynchronizable {
  /** Внутренний идентификатор сущности */
  id: string;

  /** ID в блокчейне */
  blockchain_id: string;

  /** Номер блока последнего обновления */
  block_num: number | null;

  /** Существует ли запись в блокчейне */
  present: boolean;

  /** Уникальный идентификатор сущности в блокчейне */
  getBlockchainId(): string;

  /** Номер блока последнего обновления */
  getBlockNum(): number | null;

  /** Обновление данных из блокчейна */
  updateFromBlockchain(blockchainData: any, blockNum: number, present?: boolean): void;
}

/**
 * Интерфейс для маппинга дельт блокчейна в доменные данные
 */
export interface IBlockchainDeltaMapper<TBlockchainData = any, TDomainEntity = any> {
  /** Маппинг данных дельты в блокчейн-данные */
  mapDeltaToBlockchainData(delta: IDelta): TBlockchainData | null;

  /** Получение идентификатора сущности из дельты */
  extractEntityId(delta: IDelta): string;

  /** Проверка, относится ли дельта к данному типу сущности */
  isRelevantDelta(delta: IDelta): boolean;

  /** Получение всех возможных паттернов событий  */
  getAllEventPatterns(): string[];

  /** Получение всех поддерживаемых имен таблиц */
  getSupportedTableNames(): string[];

  /** Получение всех поддерживаемых имен контрактов */
  getSupportedContractNames(): string[];
}

/**
 * Интерфейс для репозиториев с поддержкой синхронизации блокчейна
 */
export interface IBlockchainSyncRepository<TEntity extends IBlockchainSynchronizable> {
  /** Найти сущность по ID блокчейна */
  findByBlockchainId(blockchainId: string): Promise<TEntity | null>;

  /** Найти сущности с номером блока больше указанного */
  findByBlockNumGreaterThan(blockNum: number): Promise<TEntity[]>;

  /** Обновить сущность */
  update(entity: TEntity): Promise<TEntity>;

  /** Создать сущность если не существует */
  createIfNotExists(blockchainData: any, blockNum: number, present?: boolean): Promise<TEntity>;

  /** Удалить сущности с номером блока больше указанного (для обработки форков) */
  deleteByBlockNumGreaterThan(blockNum: number): Promise<void>;
}

/**
 * Результат синхронизации сущности
 */
export interface ISyncResult {
  /** Была ли сущность создана */
  created: boolean;

  /** Была ли сущность обновлена */
  updated: boolean;

  /** Идентификатор сущности */
  blockchainId: string;

  /** Номер блока */
  blockNum: number;
}
