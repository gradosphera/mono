import type * as Gateway from '../../../interfaces/gateway'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'deposits'

/**
 * Таблица хранится в {@link ContractNames._gateway | области памяти контракта}.
 */
/**
 * Этот файл содержит интерфейс для таблицы "deposits".
 */
export const scope = ContractNames._gateway

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IDeposits = Gateway.IDeposits
