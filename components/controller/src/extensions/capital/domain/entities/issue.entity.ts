import { IssuePriority } from '../enums/issue-priority.enum';
import { IssueStatus } from '../enums/issue-status.enum';
import type { IIssueDatabaseData } from '../interfaces/issue-database.interface';

/**
 * Доменная сущность задачи
 *
 * Представляет задачу в системе управления задачами
 */
export class IssueDomainEntity {
  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
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
    // Данные из базы данных
    this._id = databaseData._id;
    this.title = databaseData.title;
    this.description = databaseData.description;
    this.priority = databaseData.priority;
    this.status = databaseData.status;
    this.estimate = databaseData.estimate;
    this.sort_order = databaseData.sort_order;
    this.created_by = databaseData.created_by;
    this.creators_ids = databaseData.creators_ids;
    this.submaster_id = databaseData.submaster_id;
    this.project_hash = databaseData.project_hash;
    this.cycle_id = databaseData.cycle_id;
    this.metadata = databaseData.metadata;
  }

  /**
   * Обновление данных сущности
   */
  update(data: Partial<IIssueDatabaseData>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.priority !== undefined) this.priority = data.priority;
    if (data.status !== undefined) this.status = data.status;
    if (data.estimate !== undefined) this.estimate = data.estimate;
    if (data.sort_order !== undefined) this.sort_order = data.sort_order;
    if (data.created_by !== undefined) this.created_by = data.created_by;
    if (data.creators_ids !== undefined) this.creators_ids = data.creators_ids;
    if (data.submaster_id !== undefined) this.submaster_id = data.submaster_id;
    if (data.project_hash !== undefined) this.project_hash = data.project_hash;
    if (data.cycle_id !== undefined) this.cycle_id = data.cycle_id;
    if (data.metadata !== undefined) this.metadata = data.metadata;
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
