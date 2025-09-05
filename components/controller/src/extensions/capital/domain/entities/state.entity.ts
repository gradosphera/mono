import type { IStateDatabaseData } from '../interfaces/state-database.interface';
import type { IStateBlockchainData } from '../interfaces/state-blockchain.interface';

/**
 * Доменная сущность состояния кооператива
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные состояния из таблицы state
 */
export class StateDomainEntity {
  // Поля из базы данных
  public readonly _id: string; // Внутренний ID базы данных

  // Поля из блокчейна (state.hpp)
  public readonly coopname: IStateBlockchainData['coopname'];
  public readonly global_available_invest_pool: IStateBlockchainData['global_available_invest_pool'];
  public readonly program_membership_funded: IStateBlockchainData['program_membership_funded'];
  public readonly program_membership_available: IStateBlockchainData['program_membership_available'];
  public readonly program_membership_distributed: IStateBlockchainData['program_membership_distributed'];
  public readonly program_membership_cumulative_reward_per_share: IStateBlockchainData['program_membership_cumulative_reward_per_share'];
  public readonly config: IStateBlockchainData['config'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IStateDatabaseData, blockchainData: IStateBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;

    // Данные из блокчейна
    this.coopname = blockchainData.coopname;
    this.global_available_invest_pool = blockchainData.global_available_invest_pool;
    this.program_membership_funded = blockchainData.program_membership_funded;
    this.program_membership_available = blockchainData.program_membership_available;
    this.program_membership_distributed = blockchainData.program_membership_distributed;
    this.program_membership_cumulative_reward_per_share = blockchainData.program_membership_cumulative_reward_per_share;
    this.config = blockchainData.config;
  }
}
