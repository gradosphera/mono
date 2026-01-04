import { LogEventType } from '../enums/log-event-type.enum';

/**
 * Доменный интерфейс для данных из базы данных сущности Log
 * Содержит только поля, которые хранятся в базе данных
 */
export interface ILogDomainInterface {
  /** Внутренний идентификатор MongoDB */
  _id: string;

  /** Название кооператива */
  coopname: string;

  /** Хеш проекта или компонента, к которому относится событие */
  project_hash: string;

  /** Тип события */
  event_type: LogEventType;

  /** Инициатор действия (username пользователя) */
  initiator: string;

  /** Идентификатор-ссылка (может быть invest_hash, commit_hash, result_hash, convert_hash и т.д.) */
  reference_id?: string;

  /** Вспомогательные данные в формате JSON */
  metadata?: Record<string, any>;

  /** Текстовое описание события */
  message: string;

  /** Дата создания записи */
  created_at: Date;
}
