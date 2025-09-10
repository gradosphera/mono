import type { IssuePriority } from '../enums/issue-priority.enum';
import type { IssueStatus } from '../enums/issue-status.enum';

/**
 * Интерфейс данных задачи из базы данных
 */
export interface IIssueDatabaseData {
  _id: string; // Внутренний ID базы данных
  title: string; // Название задачи
  description?: string; // Описание задачи
  priority: IssuePriority; // Приоритет задачи
  status: IssueStatus; // Статус задачи
  estimate: number; // Оценка в story points или часах
  sort_order: number; // Порядок сортировки
  created_by: string; // ID создателя задачи (contributor)
  creators_ids: string[]; // Массив ID создателей (contributors)
  submaster_id?: string; // ID подмастерья (contributor)
  project_hash: string; // Хеш проекта
  cycle_id?: string; // ID цикла
  metadata: {
    labels: string[];
    attachments: string[];
  }; // Метаданные задачи
}
