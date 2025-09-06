import { ProgramInvestStatus } from '../enums/program-invest-status.enum';
import type { IProgramInvestDatabaseData } from '../interfaces/program-invest-database.interface';
import type { IProgramInvestBlockchainData } from '../interfaces/program-invest-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность программной инвестиции
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные программной инвестиции из таблицы progrinvests
 */
export class ProgramInvestDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ProgramInvestStatus;

  // Поля из блокчейна (program_invests.hpp)
  public coopname: IProgramInvestBlockchainData['coopname'];
  public username: IProgramInvestBlockchainData['username'];
  public invest_hash: IProgramInvestBlockchainData['invest_hash'];
  public blockchainStatus: IProgramInvestBlockchainData['status']; // Статус из блокчейна
  public invested_at: IProgramInvestBlockchainData['invested_at'];
  public statement: ISignedDocumentDomainInterface;
  public amount: IProgramInvestBlockchainData['amount'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProgramInvestDatabaseData, blockchainData: IProgramInvestBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.invest_hash = blockchainData.invest_hash;
    this.blockchainStatus = blockchainData.status;
    this.invested_at = blockchainData.invested_at;
    this.statement = blockchainData.statement;
    this.amount = blockchainData.amount;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  // Реализация IBlockchainSynchronizable
  getBlockchainId(): string {
    return this.blockchain_id;
  }

  getBlockNum(): number | null {
    return this.block_num;
  }

  updateFromBlockchain(blockchainData: IProgramInvestBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.invest_hash = blockchainData.invest_hash;
    this.blockchainStatus = blockchainData.status;
    this.invested_at = blockchainData.invested_at;
    this.statement = blockchainData.statement;
    this.amount = blockchainData.amount;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  private mapBlockchainStatusToDomain(blockchainStatus: IProgramInvestBlockchainData['status']): ProgramInvestStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'created':
        return ProgramInvestStatus.CREATED;
      default:
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CREATED`);
        return ProgramInvestStatus.CREATED;
    }
  }
}
