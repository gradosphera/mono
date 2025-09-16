import { CommitStatus } from '../enums/commit-status.enum';
import type { ICommitDatabaseData } from '../interfaces/commit-database.interface';
import type { ICommitBlockchainData } from '../interfaces/commit-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import { randomUUID } from 'crypto';

/**
 * Доменная сущность коммита
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные коммита из таблицы commits
 */
export class CommitDomainEntity implements IBlockchainSynchronizable, ICommitDatabaseData, Partial<ICommitBlockchainData> {
  // Статические поля ключей для поиска и синхронизации
  private static primary_key = 'id';
  private static sync_key = 'commit_hash';

  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public id?: number; // ID в блокчейне
  public block_num: number | undefined; // Номер блока последнего обновления
  public present = false; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: CommitStatus;

  // Поля из блокчейна (commits.hpp)
  public commit_hash: ICommitBlockchainData['commit_hash'];

  public coopname?: ICommitBlockchainData['coopname'];
  public username?: ICommitBlockchainData['username'];
  public project_hash?: ICommitBlockchainData['project_hash'];
  public amounts?: ICommitBlockchainData['amounts'];
  public blockchain_status?: ICommitBlockchainData['status']; // Статус из блокчейна
  public created_at?: ICommitBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: ICommitDatabaseData, blockchainData?: ICommitBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id == '' ? randomUUID().toString() : databaseData._id;
    this.status = this.mapStatusToDomain(databaseData.status);
    this.block_num = databaseData.block_num;
    this.commit_hash = databaseData.commit_hash.toLowerCase();
    this.present = databaseData.present;

    // Данные из блокчейна
    if (blockchainData) {
      if (this.commit_hash != blockchainData.commit_hash.toLowerCase()) throw new Error('Commit hash mismatch');

      this.id = Number(blockchainData.id);
      this.coopname = blockchainData.coopname;
      this.username = blockchainData.username;
      this.project_hash = blockchainData.project_hash.toLowerCase();
      this.commit_hash = blockchainData.commit_hash.toLowerCase();
      this.amounts = blockchainData.amounts;
      this.blockchain_status = blockchainData.status;
      this.created_at = blockchainData.created_at;

      // Синхронизация статуса с блокчейн данными
      this.status = this.mapStatusToDomain(blockchainData.status);
    }
  }

  /**
   * Получение номера блока последнего обновления
   */
  getBlockNum(): number | undefined {
    return this.block_num;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне (статический метод)
   */
  public static getPrimaryKey(): string {
    return CommitDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных (статический метод)
   */
  public static getSyncKey(): string {
    return CommitDomainEntity.sync_key;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне
   */
  getPrimaryKey(): string {
    return CommitDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных
   */
  getSyncKey(): string {
    return CommitDomainEntity.sync_key;
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: ICommitBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    Object.assign(this, blockchainData);
    this.status = this.mapStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.blockchain_status = blockchainData.status;
    this.present = present;

    // Нормализация hash полей
    if (this.commit_hash) this.commit_hash = this.commit_hash.toLowerCase();
    if (this.project_hash) this.project_hash = this.project_hash.toLowerCase();
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из commits.hpp
   */
  private mapStatusToDomain(blockchainStatus?: string): CommitStatus {
    switch (blockchainStatus) {
      case 'pending':
        return CommitStatus.PENDING;
      case 'approved':
        return CommitStatus.APPROVED;
      case 'declined':
        return CommitStatus.DECLINED;
      default:
        // По умолчанию считаем статус неопределенным

        return CommitStatus.UNDEFINED;
    }
  }
}
