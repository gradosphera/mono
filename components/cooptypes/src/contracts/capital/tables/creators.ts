import type * as Capital from '../../../interfaces/capital'
import * as ContractNames from '../../../common/names'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'creators'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица содержит информацию о создателях.
 */
export type ICreator = Capital.ICreator
