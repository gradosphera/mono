import * as Actors from '../../../common/actors'
import type * as Draft from '../../../interfaces/draft'

/**
 * Имя таблицы
 */
export const tableName = 'drafts'

/**
 * Таблица хранится в {@link Actors._contract | области памяти контракта}.
 */
export const scope = Actors._contract

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IDraft = Draft.IOnedraft
