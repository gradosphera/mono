import { ContributorStatus } from '../enums/contributor-status.enum';
import type { IContributorDatabaseData } from '../interfaces/contributor-database.interface';
import type { IContributorBlockchainData } from '../interfaces/contributor-blockchain.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import { randomUUID } from 'crypto';

/**
 * Доменная сущность вкладчика
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные вкладчика из таблицы contributors
 */
export class ContributorDomainEntity
  implements IBlockchainSynchronizable, IContributorDatabaseData, Partial<IContributorBlockchainData>
{
  // Статические поля ключей для поиска и синхронизации
  private static primary_key = 'id';
  private static sync_key = 'contributor_hash';

  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public id?: number; // ID в блокчейне
  public block_num: number | undefined; // Номер блока последнего обновления
  public present = false; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ContributorStatus;

  // Поля из блокчейна (contributors.hpp)
  public contributor_hash: IContributorBlockchainData['contributor_hash'];

  public coopname?: IContributorBlockchainData['coopname'];
  public username?: IContributorBlockchainData['username'];
  public blockchain_status?: IContributorBlockchainData['status']; // Статус из блокчейна
  public memo?: IContributorBlockchainData['memo'];
  public is_external_contract?: IContributorBlockchainData['is_external_contract'];
  public contract?: ISignedDocumentDomainInterface;
  public appendixes?: IContributorBlockchainData['appendixes'];
  public rate_per_hour?: IContributorBlockchainData['rate_per_hour'];
  public debt_amount?: IContributorBlockchainData['debt_amount'];
  public contributed_as_investor?: IContributorBlockchainData['contributed_as_investor'];
  public contributed_as_creator?: IContributorBlockchainData['contributed_as_creator'];
  public contributed_as_author?: IContributorBlockchainData['contributed_as_author'];
  public contributed_as_coordinator?: IContributorBlockchainData['contributed_as_coordinator'];
  public contributed_as_contributor?: IContributorBlockchainData['contributed_as_contributor'];
  public contributed_as_propertor?: IContributorBlockchainData['contributed_as_propertor'];
  public created_at?: IContributorBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IContributorDatabaseData, blockchainData?: IContributorBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id == '' ? randomUUID().toString() : databaseData._id;
    this.status = this.mapStatusToDomain(databaseData.status);
    this.block_num = databaseData.block_num;
    this.contributor_hash = databaseData.contributor_hash.toLowerCase();
    this.present = databaseData.present;

    // Данные из блокчейна
    if (blockchainData) {
      if (this.contributor_hash != blockchainData.contributor_hash.toLowerCase())
        throw new Error('Contributor hash mismatch');

      this.id = Number(blockchainData.id);
      this.coopname = blockchainData.coopname;
      this.username = blockchainData.username;
      this.contributor_hash = blockchainData.contributor_hash.toLowerCase();
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
      this.status = this.mapStatusToDomain(blockchainData.status);
    }
  }

  /**
   * Получение номера блока последнего обновления
   */
  getBlockNum(): number | undefined {
    return this.block_num;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне (статический метод)
   */
  public static getPrimaryKey(): string {
    return ContributorDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных (статический метод)
   */
  public static getSyncKey(): string {
    return ContributorDomainEntity.sync_key;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне
   */
  getPrimaryKey(): string {
    return ContributorDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных
   */
  getSyncKey(): string {
    return ContributorDomainEntity.sync_key;
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из contributors.hpp
   */
  private mapStatusToDomain(blockchainStatus?: string): ContributorStatus {
    switch (blockchainStatus) {
      case 'pending':
        return ContributorStatus.PENDING;
      case 'approved':
        return ContributorStatus.APPROVED;
      case 'active':
        return ContributorStatus.ACTIVE;
      case 'inactive':
        return ContributorStatus.INACTIVE;
      default:
        // По умолчанию считаем статус неопределенным

        return ContributorStatus.UNDEFINED;
    }
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: IContributorBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    Object.assign(this, blockchainData);
    this.blockchain_status = blockchainData.status;
    this.status = this.mapStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;

    // Нормализация hash полей
    if (this.contributor_hash) this.contributor_hash = this.contributor_hash.toLowerCase();
  }
}
