import type * as Soviet from '../../../interfaces/soviet'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'joincoops'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица хранит заявления на вступление в кооператив, ожидающие рассмотрения в совете.
 */
export type IJoinCoops = Soviet.IJoincoops
