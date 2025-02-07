import type * as Capital from '../../../interfaces/capital'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'state'

/**
 * Таблица хранится в {@link ContractNames._capital | области памяти контракта}.
 */
export const scope = ContractNames._capital

/**
 * @interface
 * Таблица содержит глобальное состояние кооператива.
 */
export type IState = Capital.IGlobalState
