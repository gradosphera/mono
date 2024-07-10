import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически за подписью контракта {@link ContractNames._gateway | шлюза}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: ContractNames._gateway },
] as const

/**
 * Имя действия
 */
export const actionName = 'withdraw'

/**
 * @interface
 * Действие поставляет в совет на голосование заявление на возврат паевого взноса.
 * @private
 */
export type IWithdrawDecision = Soviet.IWithdraw
