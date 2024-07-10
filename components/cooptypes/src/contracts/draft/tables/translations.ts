import * as Actors from '../../../common/actors'
import type * as Draft from '../../../interfaces/draft'

/**
 * Имя таблицы
 */
export const tableName = 'translations'

/**
 * Область хранения в памяти
 */
export const scope = Actors._contract

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type ITranslation = Draft.ITranslation
