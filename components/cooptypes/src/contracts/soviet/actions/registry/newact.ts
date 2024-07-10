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
export const actionName = 'newact'

/**
 * @interface
 * Действие фиксирует в реестре подписанные акты приёма-передачи имущества.
 */
export type INewAct = Soviet.INewact
