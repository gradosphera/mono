import type * as Wallet from '../../../interfaces/wallet'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'deposits'

/**
 * Таблица хранится в {@link ContractNames._wallet | области памяти контракта}.
 */
/**
 * Этот файл содержит интерфейс для таблицы "deposits".
 */
export const scope = ContractNames._wallet

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IDeposit = Wallet.IDeposit
