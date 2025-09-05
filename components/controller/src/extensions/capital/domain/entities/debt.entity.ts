import { DebtStatus } from '../enums/debt-status.enum';
import type { IDebtDatabaseData } from '../interfaces/debt-database.interface';
import type { IDebtBlockchainData } from '../interfaces/debt-blockchain.interface';

/**
 * Доменная сущность долга
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные долга из таблицы debts
 */
export class DebtDomainEntity {
  // Поля из базы данных
  public readonly _id: string; // Внутренний ID базы данных
  public readonly id: number; // ID в блокчейне

  // Доменные поля (расширения)
  public readonly status: DebtStatus;

  // Поля из блокчейна (debts.hpp)
  public readonly coopname: IDebtBlockchainData['coopname'];
  public readonly username: IDebtBlockchainData['username'];
  public readonly debt_hash: IDebtBlockchainData['debt_hash'];
  public readonly project_hash: IDebtBlockchainData['project_hash'];
  public readonly blockchainStatus: IDebtBlockchainData['status']; // Статус из блокчейна
  public readonly repaid_at: IDebtBlockchainData['repaid_at'];
  public readonly amount: IDebtBlockchainData['amount'];
  public readonly statement: IDebtBlockchainData['statement'];
  public readonly approved_statement: IDebtBlockchainData['approved_statement'];
  public readonly authorization: IDebtBlockchainData['authorization'];
  public readonly memo: IDebtBlockchainData['memo'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IDebtDatabaseData, blockchainData: IDebtBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.id = Number(blockchainData.id);

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
