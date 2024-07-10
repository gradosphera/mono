import type * as System from '../../../interfaces/system'
import { ContractNames } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'ramdebts'

/**
 * Таблица хранится в {@link ContractNames._system | области памяти системного контракта}.
 */
export const scope = ContractNames._system

/**
 * @interface
 */
export type IRamDebtRecord = System.IRamDebtRecord
