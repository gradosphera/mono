import { ContributorStatus } from '../enums/contributor-status.enum';
import type { IContributorDatabaseData } from '../interfaces/contributor-database.interface';
import type { IContributorBlockchainData } from '../interfaces/contributor-blockchain.interface';
import type { IBlockchainSynchronizable } from '../../../../shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность вкладчика
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные вкладчика из таблицы contributors
 */
export class ContributorDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: number; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ContributorStatus;

  // Поля из блокчейна (contributors.hpp)
  public coopname: IContributorBlockchainData['coopname'];
  public username: IContributorBlockchainData['username'];
  public contributor_hash: IContributorBlockchainData['contributor_hash'];
  public blockchain_status: IContributorBlockchainData['status']; // Статус из блокчейна
  public memo: IContributorBlockchainData['memo'];
  public is_external_contract: IContributorBlockchainData['is_external_contract'];
  public contract?: ISignedDocumentDomainInterface;
  public appendixes: IContributorBlockchainData['appendixes'];
  public rate_per_hour: IContributorBlockchainData['rate_per_hour'];
  public debt_amount: IContributorBlockchainData['debt_amount'];
  public contributed_as_investor: IContributorBlockchainData['contributed_as_investor'];
  public contributed_as_creator: IContributorBlockchainData['contributed_as_creator'];
  public contributed_as_author: IContributorBlockchainData['contributed_as_author'];
  public contributed_as_coordinator: IContributorBlockchainData['contributed_as_coordinator'];
  public contributed_as_contributor: IContributorBlockchainData['contributed_as_contributor'];
  public contributed_as_propertor: IContributorBlockchainData['contributed_as_propertor'];
  public created_at: IContributorBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IContributorDatabaseData, blockchainData: IContributorBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = Number(blockchainData.id);
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.contributor_hash = blockchainData.contributor_hash;
    this.blockchain_status = blockchainData.status;
    this.memo = blockchainData.memo;
    this.is_external_contract = blockchainData.is_external_contract;
    this.contract = blockchainData.contract;
    this.appendixes = blockchainData.appendixes;
    this.rate_per_hour = blockchainData.rate_per_hour;
    this.debt_amount = blockchainData.debt_amount;
    this.contributed_as_investor = blockchainData.contributed_as_investor;
    this.contributed_as_creator = blockchainData.contributed_as_creator;
    this.contributed_as_author = blockchainData.contributed_as_author;
    this.contributed_as_coordinator = blockchainData.contributed_as_coordinator;
    this.contributed_as_contributor = blockchainData.contributed_as_contributor;
    this.contributed_as_propertor = blockchainData.contributed_as_propertor;
    this.created_at = blockchainData.created_at;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из contributors.hpp
   */
  private mapBlockchainStatusToDomain(blockchainStatus: IContributorBlockchainData['status']): ContributorStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending':
        return ContributorStatus.PENDING;
      case 'approved':
        return ContributorStatus.APPROVED;
      case 'active':
        return ContributorStatus.ACTIVE;
      case 'inactive':
        return ContributorStatus.INACTIVE;
      default:
        // По умолчанию считаем вкладчика неактивным для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем INACTIVE`);
        return ContributorStatus.INACTIVE;
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
  updateFromBlockchain(blockchainData: IContributorBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.contributor_hash = blockchainData.contributor_hash;
    this.blockchain_status = blockchainData.status;
    this.memo = blockchainData.memo;
    this.is_external_contract = blockchainData.is_external_contract;
    this.contract = blockchainData.contract;
    this.appendixes = blockchainData.appendixes;
    this.rate_per_hour = blockchainData.rate_per_hour;
    this.debt_amount = blockchainData.debt_amount;
    this.contributed_as_investor = blockchainData.contributed_as_investor;
    this.contributed_as_creator = blockchainData.contributed_as_creator;
    this.contributed_as_author = blockchainData.contributed_as_author;
    this.contributed_as_coordinator = blockchainData.contributed_as_coordinator;
    this.contributed_as_contributor = blockchainData.contributed_as_contributor;
    this.contributed_as_propertor = blockchainData.contributed_as_propertor;
    this.created_at = blockchainData.created_at;
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }
}
