import type * as Fund from '../../../interfaces/fund'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'accfunds'

/**
 * Таблица хранится в {@link ContractNames._fund | области памяти контракта}.
 */
export const scope = ContractNames._fund

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IAccumulatedFund = Fund.IAccfund
