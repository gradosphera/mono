import type { IProjectWalletDatabaseData } from '../interfaces/project-wallet-database.interface';
import type { IProjectWalletBlockchainData } from '../interfaces/project-wallet-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность проектного кошелька
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные проектного кошелька из таблицы projwallets
 */
export class ProjectWalletDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Поля из блокчейна (wallets.hpp)
  public coopname: IProjectWalletBlockchainData['coopname'];
  public project_hash: IProjectWalletBlockchainData['project_hash'];
  public username: IProjectWalletBlockchainData['username'];
  public shares: IProjectWalletBlockchainData['shares'];
  public last_membership_reward_per_share: IProjectWalletBlockchainData['last_membership_reward_per_share'];
  public membership_available: IProjectWalletBlockchainData['membership_available'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProjectWalletDatabaseData, blockchainData: IProjectWalletBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.project_hash = blockchainData.project_hash;
    this.username = blockchainData.username;
    this.shares = blockchainData.shares;
    this.last_membership_reward_per_share = blockchainData.last_membership_reward_per_share;
    this.membership_available = blockchainData.membership_available;
  }

  // Реализация IBlockchainSynchronizable
  getBlockchainId(): string {
    return this.blockchain_id;
  }

  getBlockNum(): number | null {
    return this.block_num;
  }

  updateFromBlockchain(blockchainData: IProjectWalletBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.project_hash = blockchainData.project_hash;
    this.username = blockchainData.username;
    this.shares = blockchainData.shares;
    this.last_membership_reward_per_share = blockchainData.last_membership_reward_per_share;
    this.membership_available = blockchainData.membership_available;
    this.block_num = blockNum;
    this.present = present;
  }
}
