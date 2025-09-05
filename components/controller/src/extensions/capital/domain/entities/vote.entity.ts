import type { IVoteDatabaseData } from '../interfaces/vote-database.interface';
import type { IVoteBlockchainData } from '../interfaces/vote-blockchain.interface';

/**
 * Доменная сущность голоса
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные голоса из таблицы votes
 */
export class VoteDomainEntity {
  // Поля из базы данных
  public readonly _id: string; // Внутренний ID базы данных
  public readonly id: number; // ID в блокчейне

  // Поля из блокчейна (votes.hpp)
  public readonly project_hash: IVoteBlockchainData['project_hash'];
  public readonly voter: IVoteBlockchainData['voter'];
  public readonly recipient: IVoteBlockchainData['recipient'];
  public readonly amount: IVoteBlockchainData['amount'];
  public readonly voted_at: IVoteBlockchainData['voted_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IVoteDatabaseData, blockchainData: IVoteBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.id = Number(blockchainData.id);

    // Данные из блокчейна
    this.project_hash = blockchainData.project_hash;
    this.voter = blockchainData.voter;
    this.recipient = blockchainData.recipient;
    this.amount = blockchainData.amount;
    this.voted_at = blockchainData.voted_at;
  }
}
