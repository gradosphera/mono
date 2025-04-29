import type * as Wallet from '../../../interfaces/wallet'
import * as ContractNames from '../../../common/names'

/**
 * Имя таблицы
 */
export const tableName = 'withdraws'

/**
 * Таблица хранится в {@link ContractNames._wallet | области памяти контракта}.
 */
export const scope = ContractNames._wallet

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IWithdraws = Wallet.IWithdraw
