import { ResultStatus } from '../enums/result-status.enum';
import type { IResultDatabaseData } from '../interfaces/result-database.interface';
import type { IResultBlockchainData } from '../interfaces/result-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

/**
 * Доменная сущность результата
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные результата из таблицы results
 */
export class ResultDomainEntity implements IBlockchainSynchronizable {
  // Поля из базы данных
  public id: string; // Внутренний ID базы данных
  public blockchain_id: string; // ID в блокчейне
  public block_num: number | null; // Номер блока последнего обновления
  public present = true; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ResultStatus;

  // Поля из блокчейна (results.hpp)
  public project_hash: IResultBlockchainData['project_hash'];
  public result_hash: IResultBlockchainData['result_hash'];
  public coopname: IResultBlockchainData['coopname'];
  public username: IResultBlockchainData['username'];
  public blockchainStatus: IResultBlockchainData['status']; // Статус из блокчейна
  public created_at: IResultBlockchainData['created_at'];
  public creator_base_amount: IResultBlockchainData['creator_base_amount'];
  public author_base_amount: IResultBlockchainData['author_base_amount'];
  public debt_amount: IResultBlockchainData['debt_amount'];
  public creator_bonus_amount: IResultBlockchainData['creator_bonus_amount'];
  public author_bonus_amount: IResultBlockchainData['author_bonus_amount'];
  public generation_amount: IResultBlockchainData['generation_amount'];
  public capitalist_bonus_amount: IResultBlockchainData['capitalist_bonus_amount'];
  public total_amount: IResultBlockchainData['total_amount'];
  public available_for_return: IResultBlockchainData['available_for_return'];
  public available_for_convert: IResultBlockchainData['available_for_convert'];
  public statement: ISignedDocumentDomainInterface;
  public authorization: ISignedDocumentDomainInterface;
  public act: ISignedDocumentDomainInterface;

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IResultDatabaseData, blockchainData: IResultBlockchainData) {
    // Данные из базы данных
    this.id = databaseData.id;
    this.blockchain_id = blockchainData.id.toString();
    this.block_num = databaseData.block_num;

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
  updateFromBlockchain(blockchainData: IResultBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
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
    this.status = this.mapBlockchainStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
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
