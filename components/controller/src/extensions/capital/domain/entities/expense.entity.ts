import { ExpenseStatus } from '../enums/expense-status.enum';
import type { IExpenseDatabaseData } from '../interfaces/expense-database.interface';
import type { IExpenseBlockchainData } from '../interfaces/expense-blockchain.interface';

/**
 * Доменная сущность расхода
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные расхода из таблицы expenses
 */
export class ExpenseDomainEntity {
  // Поля из базы данных
  public readonly _id: string; // Внутренний ID базы данных
  public readonly id: number; // ID в блокчейне

  // Доменные поля (расширения)
  public readonly status: ExpenseStatus;

  // Поля из блокчейна (expenses.hpp)
  public readonly coopname: IExpenseBlockchainData['coopname'];
  public readonly username: IExpenseBlockchainData['username'];
  public readonly project_hash: IExpenseBlockchainData['project_hash'];
  public readonly expense_hash: IExpenseBlockchainData['expense_hash'];
  public readonly fund_id: IExpenseBlockchainData['fund_id'];
  public readonly blockchainStatus: IExpenseBlockchainData['status']; // Статус из блокчейна
  public readonly amount: IExpenseBlockchainData['amount'];
  public readonly description: IExpenseBlockchainData['description'];
  public readonly expense_statement: IExpenseBlockchainData['expense_statement'];
  public readonly approved_statement: IExpenseBlockchainData['approved_statement'];
  public readonly authorization: IExpenseBlockchainData['authorization'];
  public readonly spended_at: IExpenseBlockchainData['spended_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IExpenseDatabaseData, blockchainData: IExpenseBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.id = Number(blockchainData.id);

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.expense_hash = blockchainData.expense_hash;
    this.fund_id = blockchainData.fund_id;
    this.blockchainStatus = blockchainData.status;
    this.amount = blockchainData.amount;
    this.description = blockchainData.description;
    this.expense_statement = blockchainData.expense_statement;
    this.approved_statement = blockchainData.approved_statement;
    this.authorization = blockchainData.authorization;
    this.spended_at = blockchainData.spended_at;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из expenses.hpp
   */
  private mapBlockchainStatusToDomain(blockchainStatus: IExpenseBlockchainData['status']): ExpenseStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending':
        return ExpenseStatus.PENDING;
      case 'approved':
        return ExpenseStatus.APPROVED;
      case 'paid':
        return ExpenseStatus.PAID;
      case 'declined':
        return ExpenseStatus.DECLINED;
      case 'cancelled':
        return ExpenseStatus.CANCELLED;
      default:
        // По умолчанию считаем расход отмененным для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CANCELLED`);
        return ExpenseStatus.CANCELLED;
    }
  }
}
