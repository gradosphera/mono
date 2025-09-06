import { DebtStatus } from '../enums/debt-status.enum';
import type { IDebtDatabaseData } from '../interfaces/debt-database.interface';
import type { IDebtBlockchainData } from '../interfaces/debt-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность долга
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные долга из таблицы debts
 */
export class DebtDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: DebtStatus;

  // Поля из блокчейна (debts.hpp)
  public coopname: IDebtBlockchainData['coopname'];
  public username: IDebtBlockchainData['username'];
  public debt_hash: IDebtBlockchainData['debt_hash'];
  public project_hash: IDebtBlockchainData['project_hash'];
  public blockchainStatus: IDebtBlockchainData['status']; // Статус из блокчейна
  public repaid_at: IDebtBlockchainData['repaid_at'];
  public amount: IDebtBlockchainData['amount'];
  public statement: ISignedDocumentDomainInterface;
  public approved_statement: ISignedDocumentDomainInterface;
  public authorization: ISignedDocumentDomainInterface;
  public memo: IDebtBlockchainData['memo'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IDebtDatabaseData, blockchainData: IDebtBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.debt_hash = blockchainData.debt_hash;
    this.project_hash = blockchainData.project_hash;
    this.blockchainStatus = blockchainData.status;
    this.repaid_at = blockchainData.repaid_at;
    this.amount = blockchainData.amount;
    this.statement = blockchainData.statement;
    this.approved_statement = blockchainData.approved_statement;
    this.authorization = blockchainData.authorization;
    this.memo = blockchainData.memo;

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
  updateFromBlockchain(blockchainData: IDebtBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.debt_hash = blockchainData.debt_hash;
    this.project_hash = blockchainData.project_hash;
    this.blockchainStatus = blockchainData.status;
    this.repaid_at = blockchainData.repaid_at;
    this.amount = blockchainData.amount;
    this.statement = blockchainData.statement;
    this.approved_statement = blockchainData.approved_statement;
    this.authorization = blockchainData.authorization;
    this.memo = blockchainData.memo;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из debts.hpp
   */
  private mapBlockchainStatusToDomain(blockchainStatus: IDebtBlockchainData['status']): DebtStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending':
        return DebtStatus.PENDING;
      case 'approved':
        return DebtStatus.APPROVED;
      case 'active':
        return DebtStatus.ACTIVE;
      case 'settled':
        return DebtStatus.SETTLED;
      case 'cancelled':
        return DebtStatus.CANCELLED;
      default:
        // По умолчанию считаем долг отмененным для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CANCELLED`);
        return DebtStatus.CANCELLED;
    }
  }
}
