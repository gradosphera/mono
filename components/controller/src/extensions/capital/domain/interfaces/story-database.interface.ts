import type { StoryStatus } from '../enums/story-status.enum';

/**
 * Интерфейс данных истории из базы данных
 */
export interface IStoryDatabaseData {
  _id: string; // Внутренний ID базы данных
  title: string; // Название истории
  description?: string; // Описание истории
  status: StoryStatus; // Статус истории
  project_hash?: string; // Хеш проекта (если история привязана к проекту)
  issue_id?: string; // ID задачи (если история привязана к задаче)
  created_by: string; // ID создателя (contributor)
  sort_order: number; // Порядок сортировки
}
