import type { IVoteDatabaseData } from '../interfaces/vote-database.interface';
import type { IVoteBlockchainData } from '../interfaces/vote-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность голоса
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные голоса из таблицы votes
 */
export class VoteDomainEntity implements IBlockchainSynchronizable, IVoteDatabaseData, Partial<IVoteBlockchainData> {
  // Статические поля ключей для поиска и синхронизации
  private static primary_key = 'id';
  private static sync_key = ''; // Пустая строка - не ведем синхронизацию

  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public id?: number; // ID в блокчейне
  public block_num: number | undefined; // Номер блока последнего обновления
  public present = false; // Существует ли запись в блокчейне

  // Поля из блокчейна (votes.hpp)
  public project_hash?: IVoteBlockchainData['project_hash'];
  public voter?: IVoteBlockchainData['voter'];
  public recipient?: IVoteBlockchainData['recipient'];
  public amount?: IVoteBlockchainData['amount'];
  public voted_at?: IVoteBlockchainData['voted_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IVoteDatabaseData, blockchainData?: IVoteBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.block_num = databaseData.block_num;
    this.present = databaseData.present;

    // Данные из блокчейна
    if (blockchainData) {
      this.id = Number(blockchainData.id);
      this.project_hash = blockchainData.project_hash;
      this.voter = blockchainData.voter;
      this.recipient = blockchainData.recipient;
      this.amount = blockchainData.amount;
      this.voted_at = blockchainData.voted_at;
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
    return VoteDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных (статический метод)
   */
  public static getSyncKey(): string {
    return VoteDomainEntity.sync_key;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне
   */
  getPrimaryKey(): string {
    return VoteDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных
   */
  getSyncKey(): string {
    return VoteDomainEntity.sync_key;
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: IVoteBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.project_hash = blockchainData.project_hash;
    this.voter = blockchainData.voter;
    this.recipient = blockchainData.recipient;
    this.amount = blockchainData.amount;
    this.voted_at = blockchainData.voted_at;
    this.block_num = blockNum;
    this.present = present;
  }
}
