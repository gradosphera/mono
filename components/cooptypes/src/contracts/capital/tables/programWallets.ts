import type * as Capital from '../../../interfaces/capital'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'capwallets'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица содержит информацию о кошельках проектов.
 */
export type ICapitalWallet = Capital.ICapitalWallet
