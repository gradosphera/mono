import { ResultStatus } from '../enums/result-status.enum';
import type { IResultDatabaseData } from '../interfaces/result-database.interface';
import type { IResultBlockchainData } from '../interfaces/result-blockchain.interface';

/**
 * Доменная сущность результата
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные результата из таблицы results
 */
export class ResultDomainEntity {
  // Поля из базы данных
  public readonly _id: string; // Внутренний ID базы данных
  public readonly id: number; // ID в блокчейне

  // Доменные поля (расширения)
  public readonly status: ResultStatus;

  // Поля из блокчейна (results.hpp)
  public readonly project_hash: IResultBlockchainData['project_hash'];
  public readonly result_hash: IResultBlockchainData['result_hash'];
  public readonly coopname: IResultBlockchainData['coopname'];
  public readonly username: IResultBlockchainData['username'];
  public readonly blockchainStatus: IResultBlockchainData['status']; // Статус из блокчейна
  public readonly created_at: IResultBlockchainData['created_at'];
  public readonly creator_base_amount: IResultBlockchainData['creator_base_amount'];
  public readonly author_base_amount: IResultBlockchainData['author_base_amount'];
  public readonly debt_amount: IResultBlockchainData['debt_amount'];
  public readonly creator_bonus_amount: IResultBlockchainData['creator_bonus_amount'];
  public readonly author_bonus_amount: IResultBlockchainData['author_bonus_amount'];
  public readonly generation_amount: IResultBlockchainData['generation_amount'];
  public readonly capitalist_bonus_amount: IResultBlockchainData['capitalist_bonus_amount'];
  public readonly total_amount: IResultBlockchainData['total_amount'];
  public readonly available_for_return: IResultBlockchainData['available_for_return'];
  public readonly available_for_convert: IResultBlockchainData['available_for_convert'];
  public readonly statement: IResultBlockchainData['statement'];
  public readonly authorization: IResultBlockchainData['authorization'];
  public readonly act: IResultBlockchainData['act'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IResultDatabaseData, blockchainData: IResultBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.id = Number(blockchainData.id);

    // Данные из блокчейна
    this.project_hash = blockchainData.project_hash;
    this.result_hash = blockchainData.result_hash;
    this.coopname = blockchainData.coopname;
    this.username = blockchainData.username;
    this.blockchainStatus = blockchainData.status;
    this.created_at = blockchainData.created_at;
    this.creator_base_amount = blockchainData.creator_base_amount;
    this.author_base_amount = blockchainData.author_base_amount;
    this.debt_amount = blockchainData.debt_amount;
    this.creator_bonus_amount = blockchainData.creator_bonus_amount;
    this.author_bonus_amount = blockchainData.author_bonus_amount;
    this.generation_amount = blockchainData.generation_amount;
    this.capitalist_bonus_amount = blockchainData.capitalist_bonus_amount;
    this.total_amount = blockchainData.total_amount;
    this.available_for_return = blockchainData.available_for_return;
    this.available_for_convert = blockchainData.available_for_convert;
    this.statement = blockchainData.statement;
    this.authorization = blockchainData.authorization;
    this.act = blockchainData.act;

    // Синхронизация статуса с блокчейн данными
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из results.hpp
   */
  private mapBlockchainStatusToDomain(blockchainStatus: IResultBlockchainData['status']): ResultStatus {
    const statusValue = blockchainStatus.toString();

    switch (statusValue) {
      case 'pending':
        return ResultStatus.PENDING;
      case 'approved':
        return ResultStatus.APPROVED;
      case 'authorized':
        return ResultStatus.AUTHORIZED;
      case 'completed':
        return ResultStatus.COMPLETED;
      case 'declined':
        return ResultStatus.DECLINED;
      default:
        // По умолчанию считаем результат отклоненным для безопасности
        console.warn(`Неизвестный статус блокчейна: ${statusValue}, устанавливаем DECLINED`);
        return ResultStatus.DECLINED;
    }
  }
}
