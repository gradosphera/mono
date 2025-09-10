import type { ICommentDatabaseData } from '../interfaces/comment-database.interface';

/**
 * Доменная сущность комментария
 *
 * Представляет комментарий к задаче
 */
export class CommentDomainEntity {
  // Поля из базы данных
  public _id: string; // Внутренний ID базы данных
  public content: string; // Содержимое комментария
  public commentor_id: string; // ID комментатора (contributor)
  public issue_id: string; // ID задачи
  public reactions: Record<string, string[]>; // Реакции на комментарий
  public edited_at?: Date; // Дата редактирования

  /**
   * Конструктор для создания доменной сущности
   *
   * @param databaseData - данные из базы данных
   */
  constructor(databaseData: ICommentDatabaseData) {
    // Данные из базы данных
    this._id = databaseData._id;
    this.content = databaseData.content;
    this.commentor_id = databaseData.commentor_id;
    this.issue_id = databaseData.issue_id;
    this.reactions = databaseData.reactions;
    this.edited_at = databaseData.edited_at;
  }

  /**
   * Обновление данных сущности
   */
  update(data: Partial<ICommentDatabaseData>): void {
    if (data.content !== undefined) this.content = data.content;
    if (data.commentor_id !== undefined) this.commentor_id = data.commentor_id;
    if (data.issue_id !== undefined) this.issue_id = data.issue_id;
    if (data.reactions !== undefined) this.reactions = data.reactions;
    if (data.edited_at !== undefined) this.edited_at = data.edited_at;
  }
}
