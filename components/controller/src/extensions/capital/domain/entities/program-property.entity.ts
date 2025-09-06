import { ProgramPropertyStatus } from '../enums/program-property-status.enum';
import type { IProgramPropertyDatabaseData } from '../interfaces/program-property-database.interface';
import type { IProgramPropertyBlockchainData } from '../interfaces/program-property-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность программного имущественного взноса
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные программного имущественного взноса из таблицы pgproperties
 */
export class ProgramPropertyDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ProgramPropertyStatus;

  // Поля из блокчейна (program_properties.hpp)
  public coopname: IProgramPropertyBlockchainData['coopname'];
  public username: IProgramPropertyBlockchainData['username'];
  public blockchainStatus: IProgramPropertyBlockchainData['status']; // Статус из блокчейна
  public property_hash: IProgramPropertyBlockchainData['property_hash'];
  public property_amount: IProgramPropertyBlockchainData['property_amount'];
  public property_description: IProgramPropertyBlockchainData['property_description'];
  public statement: ISignedDocumentDomainInterface;
  public authorization: ISignedDocumentDomainInterface;
  public act: ISignedDocumentDomainInterface;
  public created_at: IProgramPropertyBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProgramPropertyDatabaseData, blockchainData: IProgramPropertyBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.property_hash = blockchainData.property_hash;
    this.property_amount = blockchainData.property_amount;
    this.property_description = blockchainData.property_description;
    this.statement = blockchainData.statement;
    this.authorization = blockchainData.authorization;
    this.act = blockchainData.act;
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

  updateFromBlockchain(blockchainData: IProgramPropertyBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.property_hash = blockchainData.property_hash;
    this.property_amount = blockchainData.property_amount;
    this.property_description = blockchainData.property_description;
    this.statement = blockchainData.statement;
    this.authorization = blockchainData.authorization;
    this.act = blockchainData.act;
    this.created_at = blockchainData.created_at;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  private mapBlockchainStatusToDomain(blockchainStatus: IProgramPropertyBlockchainData['status']): ProgramPropertyStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'created':
        return ProgramPropertyStatus.CREATED;
      case 'approved':
        return ProgramPropertyStatus.APPROVED;
      case 'authorized':
        return ProgramPropertyStatus.AUTHORIZED;
      case 'act1':
        return ProgramPropertyStatus.ACT1;
      case 'act2':
        return ProgramPropertyStatus.ACT2;
      default:
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CREATED`);
        return ProgramPropertyStatus.CREATED;
    }
  }
}
