import type * as Marketplace from '../../../interfaces/marketplace'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'requests'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
/**
 * Этот файл содержит интерфейс для таблицы "deposits".
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IRequest = Marketplace.IRequest
