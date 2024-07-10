import type * as System from '../../../interfaces/system'
import { ContractNames } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'producers'

/**
 * Таблица хранится в {@link ContractNames._system | области памяти системного контракта}.
 */
export const scope = ContractNames._system

/**
 * @interface
 */
export type IProducerInfo = System.IProducerInfo
