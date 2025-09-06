import { ProjectPropertyStatus } from '../enums/project-property-status.enum';
import type { IProjectPropertyDatabaseData } from '../interfaces/project-property-database.interface';
import type { IProjectPropertyBlockchainData } from '../interfaces/project-property-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность проектного имущественного взноса
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные проектного имущественного взноса из таблицы pjproperties
 */
export class ProjectPropertyDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ProjectPropertyStatus;

  // Поля из блокчейна (project_properties.hpp)
  public coopname: IProjectPropertyBlockchainData['coopname'];
  public username: IProjectPropertyBlockchainData['username'];
  public blockchainStatus: IProjectPropertyBlockchainData['status']; // Статус из блокчейна
  public project_hash: IProjectPropertyBlockchainData['project_hash'];
  public property_hash: IProjectPropertyBlockchainData['property_hash'];
  public property_amount: IProjectPropertyBlockchainData['property_amount'];
  public property_description: IProjectPropertyBlockchainData['property_description'];
  public created_at: IProjectPropertyBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProjectPropertyDatabaseData, blockchainData: IProjectPropertyBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.project_hash = blockchainData.project_hash;
    this.property_hash = blockchainData.property_hash;
    this.property_amount = blockchainData.property_amount;
    this.property_description = blockchainData.property_description;
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

  updateFromBlockchain(blockchainData: IProjectPropertyBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.project_hash = blockchainData.project_hash;
    this.property_hash = blockchainData.property_hash;
    this.property_amount = blockchainData.property_amount;
    this.property_description = blockchainData.property_description;
    this.created_at = blockchainData.created_at;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  private mapBlockchainStatusToDomain(blockchainStatus: IProjectPropertyBlockchainData['status']): ProjectPropertyStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'created':
        return ProjectPropertyStatus.CREATED;
      default:
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем CREATED`);
        return ProjectPropertyStatus.CREATED;
    }
  }
}
