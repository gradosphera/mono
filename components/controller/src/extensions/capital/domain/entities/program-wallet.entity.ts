import type { IProgramWalletDatabaseData } from '../interfaces/program-wallet-database.interface';
import type { IProgramWalletBlockchainData } from '../interfaces/program-wallet-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность программного кошелька
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные программного кошелька из таблицы capwallets
 */
export class ProgramWalletDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Поля из блокчейна (wallets.hpp)
  public coopname: IProgramWalletBlockchainData['coopname'];
  public username: IProgramWalletBlockchainData['username'];
  public last_program_crps: IProgramWalletBlockchainData['last_program_crps'];
  public capital_available: IProgramWalletBlockchainData['capital_available'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProgramWalletDatabaseData, blockchainData: IProgramWalletBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.last_program_crps = blockchainData.last_program_crps;
    this.capital_available = blockchainData.capital_available;
  }

  // Реализация IBlockchainSynchronizable
  getBlockchainId(): string {
    return this.blockchain_id;
  }

  getBlockNum(): number | null {
    return this.block_num;
  }

  updateFromBlockchain(blockchainData: IProgramWalletBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.last_program_crps = blockchainData.last_program_crps;
    this.capital_available = blockchainData.capital_available;
    this.block_num = blockNum;
    this.present = present;
  }
}
