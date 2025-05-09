import type * as Registrator from '../../../interfaces/registrator'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'coops'

/**
 * Таблица хранится в {@link ContractNames._registrator | области памяти контракта}.
 */
export const scope = ContractNames._registrator

/**
 * @interface
 * Таблица содержит реестр кооперативов.
 */
export type ICooperative = Registrator.ICooperative2
