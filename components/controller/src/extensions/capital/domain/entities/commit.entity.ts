import { CommitStatus } from '../enums/commit-status.enum';
import type { ICommitDatabaseData } from '../interfaces/commit-database.interface';
import type { ICommitBlockchainData } from '../interfaces/commit-blockchain.interface';

/**
 * Доменная сущность коммита
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные коммита из таблицы commits
 */
export class CommitDomainEntity {
  // Поля из базы данных
  public readonly _id: string; // Внутренний ID базы данных
  public readonly id: number; // ID в блокчейне

  // Доменные поля (расширения)
  public readonly status: CommitStatus;

  // Поля из блокчейна (commits.hpp)
  public readonly coopname: ICommitBlockchainData['coopname'];
  public readonly username: ICommitBlockchainData['username'];
  public readonly project_hash: ICommitBlockchainData['project_hash'];
  public readonly commit_hash: ICommitBlockchainData['commit_hash'];
  public readonly amounts: ICommitBlockchainData['amounts'];
  public readonly blockchainStatus: ICommitBlockchainData['status']; // Статус из блокчейна
  public readonly created_at: ICommitBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: ICommitDatabaseData, blockchainData: ICommitBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.id = Number(blockchainData.id);

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
