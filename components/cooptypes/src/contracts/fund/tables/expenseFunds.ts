import type * as Fund from '../../../interfaces/fund'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'expfunds'

/**
 * Таблица хранится в {@link ContractNames._fund | области памяти контракта}.
 */
export const scope = ContractNames._fund

/**
 * @interface
 */
export type IExpensedFund = Fund.IExpfund
