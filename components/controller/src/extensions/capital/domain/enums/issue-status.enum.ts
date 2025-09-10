/**
 * Перечисление статусов задач
 */
export enum IssueStatus {
  BACKLOG = 'backlog', // В бэклоге
  TODO = 'todo', // К выполнению
  IN_PROGRESS = 'in_progress', // В работе
  DONE = 'done', // Выполнена
  CANCELED = 'canceled', // Отменена
}
