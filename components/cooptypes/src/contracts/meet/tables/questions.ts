import * as Actors from '../../../common/actors'
import type * as Meet from '../../../interfaces/meet'

/**
 * Имя таблицы
 */
export const tableName = 'questions'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти контракта}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IOutput = Meet.IQuestion
