import * as Actors from '../../../common/actors'
import type * as Branch from '../../../interfaces/branch'

/**
 * Имя таблицы
 */
export const tableName = 'branchstat'

/**
 * Таблица хранится в {@link Actors._contract | области памяти контракта}.
 */
export const scope = Actors._contract

/**
 * @interface
 * Таблица содержит переводы черновиков документов.
 */
export type IBranchStat = Branch.IBranchstat
