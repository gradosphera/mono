import { StoryStatus } from '../enums/story-status.enum';
import type { IStoryDatabaseData } from '../interfaces/story-database.interface';
import { randomUUID } from 'crypto';
/**
 * Доменная сущность истории (критерия выполнения)
 *
 * Представляет пользовательскую историю или критерий выполнения,
 * которая может быть привязана к проекту или задаче
 */
export class StoryDomainEntity {
  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public title: string; // Название истории
  public description?: string; // Описание истории
  public status: StoryStatus; // Статус истории
  public project_hash?: string; // Хеш проекта (если история привязана к проекту)
  public issue_id?: string; // ID задачи (если история привязана к задаче)
  public created_by: string; // ID создателя (contributor)
  public sort_order: number; // Порядок сортировки

  /**
   * Конструктор для создания доменной сущности
   *
   * @param databaseData - данные из базы данных
   */
  constructor(databaseData: IStoryDatabaseData) {
    // Данные из базы данных
    this._id = databaseData._id == '' ? randomUUID().toString() : databaseData._id;
    this.title = databaseData.title;
    this.description = databaseData.description;
    this.status = databaseData.status;
    this.project_hash = databaseData.project_hash;
    this.issue_id = databaseData.issue_id;
    this.created_by = databaseData.created_by;
    this.sort_order = databaseData.sort_order;
  }

  /**
   * Обновление данных сущности
   */
  update(data: Partial<IStoryDatabaseData>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.status !== undefined) this.status = data.status;
    if (data.project_hash !== undefined) this.project_hash = data.project_hash;
    if (data.issue_id !== undefined) this.issue_id = data.issue_id;
    if (data.created_by !== undefined) this.created_by = data.created_by;
    if (data.sort_order !== undefined) this.sort_order = data.sort_order;
  }
}
