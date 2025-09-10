/**
 * Интерфейс данных комментария из базы данных
 */
export interface ICommentDatabaseData {
  _id: string; // Внутренний ID базы данных
  content: string; // Содержимое комментария
  commentor_id: string; // ID комментатора (contributor)
  issue_id: string; // ID задачи
  reactions: Record<string, string[]>; // Реакции на комментарий
  edited_at?: Date; // Дата редактирования
}
