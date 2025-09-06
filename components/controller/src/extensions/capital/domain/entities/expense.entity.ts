import { ExpenseStatus } from '../enums/expense-status.enum';
import type { IExpenseDatabaseData } from '../interfaces/expense-database.interface';
import type { IExpenseBlockchainData } from '../interfaces/expense-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность расхода
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные расхода из таблицы expenses
 */
export class ExpenseDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ExpenseStatus;

  // Поля из блокчейна (expenses.hpp)
  public coopname: IExpenseBlockchainData['coopname'];
  public username: IExpenseBlockchainData['username'];
  public project_hash: IExpenseBlockchainData['project_hash'];
  public expense_hash: IExpenseBlockchainData['expense_hash'];
  public fund_id: IExpenseBlockchainData['fund_id'];
  public blockchainStatus: IExpenseBlockchainData['status']; // Статус из блокчейна
  public amount: IExpenseBlockchainData['amount'];
  public description: IExpenseBlockchainData['description'];
  public expense_statement: ISignedDocumentDomainInterface;
  public approved_statement: ISignedDocumentDomainInterface;
  public authorization: ISignedDocumentDomainInterface;
  public spended_at: IExpenseBlockchainData['spended_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IExpenseDatabaseData, blockchainData: IExpenseBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

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
  updateFromBlockchain(blockchainData: IExpenseBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
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
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
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
