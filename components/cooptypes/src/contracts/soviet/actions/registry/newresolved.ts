import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически по ходу работы системы за подписью контракта _soviet.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._soviet }] as const

/**
 * Имя действия
 */
export const actionName = 'newresolved'

/**
 * @interface
 * Действие фиксирует принятое заявление в реестре после принятия решения советом кооператива.
 * @private
 */
export type INewResolved = Soviet.INewresolved
