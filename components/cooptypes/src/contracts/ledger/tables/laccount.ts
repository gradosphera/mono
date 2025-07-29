import * as Actors from '../../../common/actors'
import type * as Ledger from '../../../interfaces/ledger'

/**
 * Имя таблицы
 */
export const tableName = 'accounts'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица содержит счета кооператива.
 */
export type ILaccount = Ledger.ILaccount
