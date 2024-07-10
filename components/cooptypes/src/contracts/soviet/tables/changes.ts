import type * as Soviet from '../../../interfaces/soviet'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'changes'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Зарегистрированные пары заявлений на взнос и возврат взносов через смарт-контракт маркетплейса.
 */
export type IChanges = Soviet.IChanges
