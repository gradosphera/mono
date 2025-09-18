import { IssuePriority } from '../enums/issue-priority.enum';
import { IssueStatus } from '../enums/issue-status.enum';
import type { IIssueDatabaseData } from '../interfaces/issue-database.interface';
import { BaseDomainEntity } from './base.entity';

/**
 * Доменная сущность задачи
 *
 * Представляет задачу в системе управления задачами
 */
export class IssueDomainEntity extends BaseDomainEntity<IIssueDatabaseData> {
  // Специфичные поля для задачи
  public issue_hash: string; // Хеш задачи для внешних ссылок
  public coopname: string; // Имя аккаунта кооператива
  public title: string; // Название задачи
  public description?: string; // Описание задачи
  public priority: IssuePriority; // Приоритет задачи
  public status: IssueStatus; // Статус задачи
  public estimate: number; // Оценка в story points или часах
  public sort_order: number; // Порядок сортировки
  public created_by: string; // ID создателя задачи (contributor)
  public submaster_id?: string; // ID подмастерья (contributor)
  public creators_ids: string[]; // Массив ID создателей (contributors)
  public project_hash: string; // Хеш проекта
  public cycle_id?: string; // ID цикла
  public metadata: {
    labels: string[];
    attachments: string[];
  }; // Метаданные задачи

  /**
   * Конструктор для создания доменной сущности
   *
   * @param databaseData - данные из базы данных
   */
  constructor(databaseData: IIssueDatabaseData) {
    // Вызываем конструктор базового класса
    super(databaseData, IssueStatus.BACKLOG);

    // Устанавливаем специфичные поля задачи
    this.issue_hash = databaseData.issue_hash.toLowerCase();
    this.coopname = databaseData.coopname;
    this.title = databaseData.title;
    this.description = databaseData.description;
    this.priority = databaseData.priority;
    this.status = databaseData.status; // Переопределяем статус с правильным типом
    this.estimate = databaseData.estimate;
    this.sort_order = databaseData.sort_order;
    this.created_by = databaseData.created_by;
    this.creators_ids = databaseData.creators_ids;
    this.submaster_id = databaseData.submaster_id;
    this.project_hash = databaseData.project_hash.toLowerCase();
    this.cycle_id = databaseData.cycle_id;
    this.metadata = databaseData.metadata;
  }

  /**
   * Добавление подмастерья
   * Автоматически добавляет его в creators_ids если его там нет
   */
  setSubmaster(submasterId: string): void {
    this.submaster_id = submasterId;
    if (!this.creators_ids.includes(submasterId)) {
      this.creators_ids.push(submasterId);
    }
  }

  /**
   * Добавление создателя
   */
  addCreator(creatorId: string): void {
    if (!this.creators_ids.includes(creatorId)) {
      this.creators_ids.push(creatorId);
    }
  }

  /**
   * Удаление создателя
   */
  removeCreator(creatorId: string): void {
    this.creators_ids = this.creators_ids.filter((id) => id !== creatorId);
    // Если удаляем подмастерья, то очищаем submaster_id
    if (this.submaster_id === creatorId) {
      this.submaster_id = undefined;
    }
  }
}
