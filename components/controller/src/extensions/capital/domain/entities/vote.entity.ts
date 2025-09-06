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
export class VoteDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Поля из блокчейна (votes.hpp)
  public project_hash: IVoteBlockchainData['project_hash'];
  public voter: IVoteBlockchainData['voter'];
  public recipient: IVoteBlockchainData['recipient'];
  public amount: IVoteBlockchainData['amount'];
  public voted_at: IVoteBlockchainData['voted_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IVoteDatabaseData, blockchainData: IVoteBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

    // Данные из блокчейна
    this.project_hash = blockchainData.project_hash;
    this.voter = blockchainData.voter;
    this.recipient = blockchainData.recipient;
    this.amount = blockchainData.amount;
    this.voted_at = blockchainData.voted_at;
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
