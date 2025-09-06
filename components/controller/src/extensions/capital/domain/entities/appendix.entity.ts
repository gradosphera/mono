import { AppendixStatus } from '../enums/appendix-status.enum';
import type { IAppendixDatabaseData } from '../interfaces/appendix-database.interface';
import type { IAppendixBlockchainData } from '../interfaces/appendix-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность приложения
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные приложения из таблицы appendixes
 */
export class AppendixDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: AppendixStatus;

  // Поля из блокчейна (appendix.hpp)
  public coopname: IAppendixBlockchainData['coopname'];
  public username: IAppendixBlockchainData['username'];
  public project_hash: IAppendixBlockchainData['project_hash'];
  public appendix_hash: IAppendixBlockchainData['appendix_hash'];
  public blockchainStatus: IAppendixBlockchainData['status']; // Статус из блокчейна
  public created_at: IAppendixBlockchainData['created_at'];
  public appendix: ISignedDocumentDomainInterface;

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IAppendixDatabaseData, blockchainData: IAppendixBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.appendix_hash = blockchainData.appendix_hash;
    this.blockchainStatus = blockchainData.status;
    this.created_at = blockchainData.created_at;
    this.appendix = blockchainData.appendix;

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

  updateFromBlockchain(blockchainData: IAppendixBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.project_hash = blockchainData.project_hash;
    this.appendix_hash = blockchainData.appendix_hash;
    this.blockchainStatus = blockchainData.status;
    this.created_at = blockchainData.created_at;
    this.appendix = blockchainData.appendix;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  private mapBlockchainStatusToDomain(blockchainStatus: IAppendixBlockchainData['status']): AppendixStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'created':
        return AppendixStatus.CREATED;
      default:
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CREATED`);
        return AppendixStatus.CREATED;
    }
  }
}
