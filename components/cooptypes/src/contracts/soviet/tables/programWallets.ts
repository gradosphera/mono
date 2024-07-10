import type * as Soviet from '../../../interfaces/soviet'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'progwallets'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица хранит информацию о балансах пайщиков в целевых потребительских программах кооператива.
 */
export type IProgramWallet = Soviet.IProgwallet
