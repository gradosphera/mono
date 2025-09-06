import type { IStateDatabaseData } from '../interfaces/state-database.interface';
import type { IStateBlockchainData } from '../interfaces/state-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность состояния кооператива
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные состояния из таблицы state
 */
export class StateDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Поля из блокчейна (state.hpp)
  public coopname: IStateBlockchainData['coopname'];
  public global_available_invest_pool: IStateBlockchainData['global_available_invest_pool'];
  public program_membership_funded: IStateBlockchainData['program_membership_funded'];
  public program_membership_available: IStateBlockchainData['program_membership_available'];
  public program_membership_distributed: IStateBlockchainData['program_membership_distributed'];
  public program_membership_cumulative_reward_per_share: IStateBlockchainData['program_membership_cumulative_reward_per_share'];
  public config: IStateBlockchainData['config'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IStateDatabaseData, blockchainData: IStateBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.coopname; // Для state сущности blockchain_id = coopname
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.global_available_invest_pool = blockchainData.global_available_invest_pool;
    this.program_membership_funded = blockchainData.program_membership_funded;
    this.program_membership_available = blockchainData.program_membership_available;
    this.program_membership_distributed = blockchainData.program_membership_distributed;
    this.program_membership_cumulative_reward_per_share = blockchainData.program_membership_cumulative_reward_per_share;
    this.config = blockchainData.config;
  }

  /**
   * Получение ID сущности в блокчейне
   */
  getBlockchainId(): string {
    return this.blockchain_id;
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
  updateFromBlockchain(blockchainData: IStateBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.global_available_invest_pool = blockchainData.global_available_invest_pool;
    this.program_membership_funded = blockchainData.program_membership_funded;
    this.program_membership_available = blockchainData.program_membership_available;
    this.program_membership_distributed = blockchainData.program_membership_distributed;
    this.program_membership_cumulative_reward_per_share = blockchainData.program_membership_cumulative_reward_per_share;
    this.config = blockchainData.config;
    this.block_num = blockNum;
    this.present = present;
  }
}
