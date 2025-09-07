import { ProjectStatus } from '../enums/project-status.enum';
import type { IProjectDomainInterfaceDatabaseData } from '../interfaces/project-database.interface';
import type { IProjectDomainInterfaceBlockchainData } from '../interfaces/project-blockchain.interface';
import type { IBlockchainSynchronizable } from '~/shared/interfaces/blockchain-sync.interface';

/**
 * Доменная сущность проекта
 *
 * Полностью агрегирует данные из двух источников:
 * - База данных: внутренний ID, ссылка на блокчейн
 * - Блокчейн: все данные проекта из таблицы projects
 */
export class ProjectDomainEntity
  implements IBlockchainSynchronizable, IProjectDomainInterfaceDatabaseData, Partial<IProjectDomainInterfaceBlockchainData>
{
  // Статические поля ключей для поиска и синхронизации
  private static primary_key = 'id';
  private static sync_key = 'project_hash';

  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public id?: number; // ID в блокчейне
  public block_num: number | undefined; // Номер блока последнего обновления
  public present = false; // Существует ли запись в блокчейне

  // Доменные поля (расширения)
  public status: ProjectStatus;

  // Поля из блокчейна (projects.hpp)
  public project_hash: IProjectDomainInterfaceBlockchainData['project_hash'];

  public coopname?: IProjectDomainInterfaceBlockchainData['coopname'];
  public parent_hash?: IProjectDomainInterfaceBlockchainData['parent_hash'];
  public blockchain_status?: IProjectDomainInterfaceBlockchainData['status']; // Статус из блокчейна
  public is_opened?: IProjectDomainInterfaceBlockchainData['is_opened'];
  public is_planed?: IProjectDomainInterfaceBlockchainData['is_planed'];
  public can_convert_to_project?: IProjectDomainInterfaceBlockchainData['can_convert_to_project'];
  public master?: IProjectDomainInterfaceBlockchainData['master'];
  public title?: IProjectDomainInterfaceBlockchainData['title'];
  public description?: IProjectDomainInterfaceBlockchainData['description'];
  public meta?: IProjectDomainInterfaceBlockchainData['meta'];
  public counts?: IProjectDomainInterfaceBlockchainData['counts'];
  public plan?: IProjectDomainInterfaceBlockchainData['plan'];
  public fact?: IProjectDomainInterfaceBlockchainData['fact'];
  public crps?: IProjectDomainInterfaceBlockchainData['crps'];
  public voting?: IProjectDomainInterfaceBlockchainData['voting'];
  public membership?: IProjectDomainInterfaceBlockchainData['membership'];
  public created_at?: IProjectDomainInterfaceBlockchainData['created_at'];

  /**
   * Конструктор для сборки композитной сущности
   *
   * @param databaseData - данные из базы данных
   * @param blockchainData - данные из блокчейна
   */
  constructor(databaseData: IProjectDomainInterfaceDatabaseData, blockchainData?: IProjectDomainInterfaceBlockchainData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.status = this.mapStatusToDomain(databaseData.status);
    this.block_num = databaseData.block_num;
    this.project_hash = databaseData.project_hash;
    this.present = databaseData.present;

    // Данные из блокчейна
    if (blockchainData) {
      if (this.project_hash != blockchainData.project_hash) throw new Error('Project hash mismatch');

      this.id = Number(blockchainData.id);
      this.coopname = blockchainData.coopname;
      this.project_hash = blockchainData.project_hash;
      this.parent_hash = blockchainData.parent_hash;
      this.blockchain_status = blockchainData.status;
      this.is_opened = blockchainData.is_opened;
      this.is_planed = blockchainData.is_planed;
      this.can_convert_to_project = blockchainData.can_convert_to_project;
      this.master = blockchainData.master;
      this.title = blockchainData.title;
      this.description = blockchainData.description;
      this.meta = blockchainData.meta;
      this.counts = blockchainData.counts;
      this.plan = blockchainData.plan;
      this.fact = blockchainData.fact;
      this.crps = blockchainData.crps;
      this.voting = blockchainData.voting;
      this.membership = blockchainData.membership;
      this.created_at = blockchainData.created_at;

      // Синхронизация статуса с блокчейн данными
      this.status = this.mapStatusToDomain(blockchainData.status);
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
    return ProjectDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных (статический метод)
   */
  public static getSyncKey(): string {
    return ProjectDomainEntity.sync_key;
  }

  /**
   * Получение ключа для поиска сущности в блокчейне
   */
  getPrimaryKey(): string {
    return ProjectDomainEntity.primary_key;
  }

  /**
   * Получение ключа для синхронизации сущности в блокчейне и базе данных
   */
  getSyncKey(): string {
    return ProjectDomainEntity.sync_key;
  }

  /**
   * Обновление данных из блокчейна
   * Обновляет текущий экземпляр
   */
  updateFromBlockchain(blockchainData: IProjectDomainInterfaceBlockchainData, blockNum: number, present = true): void {
    // Обновляем все поля из блокчейна
    this.coopname = blockchainData.coopname;
    this.project_hash = blockchainData.project_hash;
    this.parent_hash = blockchainData.parent_hash;
    this.blockchain_status = blockchainData.status;
    this.is_opened = blockchainData.is_opened;
    this.is_planed = blockchainData.is_planed;
    this.can_convert_to_project = blockchainData.can_convert_to_project;
    this.master = blockchainData.master;
    this.title = blockchainData.title;
    this.description = blockchainData.description;
    this.meta = blockchainData.meta;
    this.counts = blockchainData.counts;
    this.plan = blockchainData.plan;
    this.fact = blockchainData.fact;
    this.crps = blockchainData.crps;
    this.voting = blockchainData.voting;
    this.membership = blockchainData.membership;
    this.created_at = blockchainData.created_at;
    this.status = this.mapStatusToDomain(blockchainData.status);
    this.block_num = blockNum;
    this.present = present;
  }

  /**
   * Маппинг статуса из блокчейна в доменный статус
   * Синхронизировано с константами из projects.hpp
   */
  private mapStatusToDomain(blockchainStatus?: string): ProjectStatus {
    switch (blockchainStatus) {
      case 'pending':
        return ProjectStatus.PENDING;
      case 'active':
        return ProjectStatus.ACTIVE;
      case 'voting':
        return ProjectStatus.VOTING;
      case 'completed':
        return ProjectStatus.COMPLETED;
      case 'closed':
        return ProjectStatus.CLOSED;
      default:
        // По умолчанию считаем статус неопределенным
        console.warn(`Неизвестный статус: ${blockchainStatus}, устанавливаем UNDEFINED`);
        return ProjectStatus.UNDEFINED;
    }
  }
}
