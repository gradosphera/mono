import { CommitStatus } from '../enums/commit-status.enum';
import type { ICommitDatabaseData } from '../interfaces/commit-database.interface';
import type { ICommitBlockchainData } from '../interfaces/commit-blockchain.interface';
import type { IBlockchainSynchronizable } from '../../../../shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность коммита
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные коммита из таблицы commits
 */
export class CommitDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: CommitStatus;

  // Поля из блокчейна (commits.hpp)
  public coopname: ICommitBlockchainData['coopname'];
  public username: ICommitBlockchainData['username'];
  public project_hash: ICommitBlockchainData['project_hash'];
  public commit_hash: ICommitBlockchainData['commit_hash'];
  public amounts: ICommitBlockchainData['amounts'];
  public blockchainStatus: ICommitBlockchainData['status']; // Статус из блокчейна
  public created_at: ICommitBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: ICommitDatabaseData, blockchainData: ICommitBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.commit_hash = blockchainData.commit_hash;
    this.amounts = blockchainData.amounts;
    this.blockchainStatus = blockchainData.status;
    this.created_at = blockchainData.created_at;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  /**
   * Получение ID сущности в блокчейне
   */
  getBlockchainId(): string {
    return this.blockchain_id;
  }

  /**
   * Получение номера блока последнего обновления
   */
  getBlockNum(): number | null {
    return this.block_num;
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: ICommitBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.commit_hash = blockchainData.commit_hash;
    this.amounts = blockchainData.amounts;
    this.blockchainStatus = blockchainData.status;
    this.created_at = blockchainData.created_at;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из commits.hpp
   */
  private mapBlockchainStatusToDomain(blockchainStatus: ICommitBlockchainData['status']): CommitStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending':
        return CommitStatus.PENDING;
      case 'approved':
        return CommitStatus.APPROVED;
      case 'declined':
        return CommitStatus.DECLINED;
      default:
        // По умолчанию считаем коммит отклоненным для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем DECLINED`);
        return CommitStatus.DECLINED;
    }
  }
}
