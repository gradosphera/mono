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
export class StateDomainEntity implements IBlockchainSynchronizable, IStateDatabaseData, Partial<IStateBlockchainData> {
  // Статические поля ключей для поиска и синхронизации
  private static primary_key = 'coopname';
  private static sync_key = 'coopname';

  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public block_num?: number; // Номер блока последнего обновления
  public present = false; // Существует ли запись в блокчейне

  // Поля из блокчейна (state.hpp)
  public coopname: IStateBlockchainData['coopname'];
  public global_available_invest_pool?: IStateBlockchainData['global_available_invest_pool'];
  public program_membership_funded?: IStateBlockchainData['program_membership_funded'];
  public program_membership_available?: IStateBlockchainData['program_membership_available'];
  public program_membership_distributed?: IStateBlockchainData['program_membership_distributed'];
  public program_membership_cumulative_reward_per_share?: IStateBlockchainData['program_membership_cumulative_reward_per_share'];
  public config?: IStateBlockchainData['config'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IStateDatabaseData, blockchainData?: IStateBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;

    this.present = databaseData.present;
    this.block_num = databaseData.block_num;
    this.coopname = databaseData.coopname;

    // Данные из блокчейна
    if (blockchainData) {
      this.coopname = blockchainData.coopname;
      this.global_available_invest_pool = blockchainData.global_available_invest_pool;
      this.program_membership_funded = blockchainData.program_membership_funded;
      this.program_membership_available = blockchainData.program_membership_available;
      this.program_membership_distributed = blockchainData.program_membership_distributed;
      this.program_membership_cumulative_reward_per_share = blockchainData.program_membership_cumulative_reward_per_share;
      this.config = blockchainData.config;
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
    return StateDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных (статический метод)
   */
  public static getSyncKey(): string {
    return StateDomainEntity.sync_key;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне
   */
  getPrimaryKey(): string {
    return StateDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных
   */
  getSyncKey(): string {
    return StateDomainEntity.sync_key;
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: IStateBlockchainData, blockNum: number, present = true): void {
    if (this.coopname !== blockchainData.coopname) throw new Error('Coopname mismatch');

    // Обновляем все поля из блокчейна
    Object.assign(this, blockchainData);
    this.block_num = blockNum;
    this.present = present;
  }
}
