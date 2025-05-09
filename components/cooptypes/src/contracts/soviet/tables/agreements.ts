import type * as Soviet from '../../../interfaces/soviet'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'agreements2'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 */
export type IAgreement = Soviet.IAgreement2
