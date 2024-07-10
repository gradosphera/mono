import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически за подписью контракта {@link ContractNames._fund | фондов}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: ContractNames._fund },
] as const

/**
 * Имя действия
 */
export const actionName = 'fundwithdraw'

/**
 * @interface
 * Действие поставляет в совет на голосование документ о необходимости использования средств фондов кооператива (кроме паевого).
 * @private
 */
export type IFundWithdrawDecision = Soviet.IFundwithdraw
