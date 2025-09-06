import { ProgramWithdrawStatus } from '../enums/program-withdraw-status.enum';
import type { IProgramWithdrawDatabaseData } from '../interfaces/program-withdraw-database.interface';
import type { IProgramWithdrawBlockchainData } from '../interfaces/program-withdraw-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность возврата из программы
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные возврата из программы из таблицы prgwithdraws
 */
export class ProgramWithdrawDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ProgramWithdrawStatus;

  // Поля из блокчейна (program_withdraw.hpp)
  public coopname: IProgramWithdrawBlockchainData['coopname'];
  public withdraw_hash: IProgramWithdrawBlockchainData['withdraw_hash'];
  public username: IProgramWithdrawBlockchainData['username'];
  public blockchainStatus: IProgramWithdrawBlockchainData['status']; // Статус из блокчейна
  public amount: IProgramWithdrawBlockchainData['amount'];
  public statement: ISignedDocumentDomainInterface;
  public created_at: IProgramWithdrawBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProgramWithdrawDatabaseData, blockchainData: IProgramWithdrawBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.withdraw_hash = blockchainData.withdraw_hash;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.amount = blockchainData.amount;
    this.statement = blockchainData.statement;
    this.created_at = blockchainData.created_at;

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

  updateFromBlockchain(blockchainData: IProgramWithdrawBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.withdraw_hash = blockchainData.withdraw_hash;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.amount = blockchainData.amount;
    this.statement = blockchainData.statement;
    this.created_at = blockchainData.created_at;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  private mapBlockchainStatusToDomain(blockchainStatus: IProgramWithdrawBlockchainData['status']): ProgramWithdrawStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'created':
        return ProgramWithdrawStatus.CREATED;
      case 'approved':
        return ProgramWithdrawStatus.APPROVED;
      default:
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CREATED`);
        return ProgramWithdrawStatus.CREATED;
    }
  }
}
