import type * as Soviet from '../../../interfaces/soviet'
import { Actors } from '../../../common'

/**
 * Имя таблицы
 */
export const tableName = 'participants'

/**
 * Таблица хранится в {@link Actors._coopname | области памяти кооператива}.
 */
export const scope = Actors._coopname

/**
 * @interface
 * Таблица хранит публичную часть реестра пайщиков кооператива.
 */
export type IParticipants = Soviet.IParticipants
