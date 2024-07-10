import type * as Marketplace from '../../../interfaces/msig'
import { ContractNames } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'invals'

/**
 * Таблица хранится в {@link ContractNames._msig | области памяти контракта}.
 */
export const scope = ContractNames._msig

/**
 * @interface
 */
export type IInvalidation = Marketplace.IInvalidation
