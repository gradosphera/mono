import type * as Token from '../../../interfaces/token'

/**
 * Имя таблицы
 */
export const tableName = 'stat'

/**
 * Таблица хранится в области памяти символа токена "AXON".
 */
export const scope = 'AXON'

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type ICurrencyStats = Token.ICurrencyStats
