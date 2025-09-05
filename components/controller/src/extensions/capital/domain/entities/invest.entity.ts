import { InvestStatus } from '../enums/invest-status.enum';
import type { IInvestDatabaseData } from '../interfaces/invest-database.interface';
import type { IInvestBlockchainData } from '../interfaces/invest-blockchain.interface';
import type { IBlockchainSynchronizable } from '../../../../shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность инвестиции
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные инвестиции из таблицы invests
 */
export class InvestDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: InvestStatus;

  // Поля из блокчейна (invests.hpp)
  public coopname: IInvestBlockchainData['coopname'];
  public username: IInvestBlockchainData['username'];
  public invest_hash: IInvestBlockchainData['invest_hash'];
  public project_hash: IInvestBlockchainData['project_hash'];
  public blockchain_status: IInvestBlockchainData['status']; // Статус из блокчейна
  public amount: IInvestBlockchainData['amount'];
  public invested_at: IInvestBlockchainData['invested_at'];
  public statement: IInvestBlockchainData['statement'];
  public coordinator: IInvestBlockchainData['coordinator'];
  public coordinator_amount: IInvestBlockchainData['coordinator_amount'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IInvestDatabaseData, blockchainData: IInvestBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.invest_hash = blockchainData.invest_hash;
    this.project_hash = blockchainData.project_hash;
    this.blockchain_status = blockchainData.status;
    this.amount = blockchainData.amount;
    this.invested_at = blockchainData.invested_at;
    this.statement = blockchainData.statement;
    this.coordinator = blockchainData.coordinator;
    this.coordinator_amount = blockchainData.coordinator_amount;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из invests.hpp
   */
  private mapBlockchainStatusToDomain(blockchain_status: IInvestBlockchainData['status']): InvestStatus {
    const statusValue = blockchain_status.toString();

    switch (statusValue) {
      case 'pending':
        return InvestStatus.PENDING;
      case 'approved':
        return InvestStatus.APPROVED;
      case 'active':
        return InvestStatus.ACTIVE;
      case 'returned':
        return InvestStatus.RETURNED;
      case 'cancelled':
        return InvestStatus.CANCELLED;
      default:
        // По умолчанию считаем инвестицию отмененной для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CANCELLED`);
        return InvestStatus.CANCELLED;
    }
  }

  /**
   * Получение ID сущности в блокчейне
   */
  getBlockchainId(): string {
    return this.blockchain_id.toString();
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
  updateFromBlockchain(blockchainData: IInvestBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.invest_hash = blockchainData.invest_hash;
    this.project_hash = blockchainData.project_hash;
    this.blockchain_status = blockchainData.status;
    this.amount = blockchainData.amount;
    this.invested_at = blockchainData.invested_at;
    this.statement = blockchainData.statement;
    this.coordinator = blockchainData.coordinator;
    this.coordinator_amount = blockchainData.coordinator_amount;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }
}
