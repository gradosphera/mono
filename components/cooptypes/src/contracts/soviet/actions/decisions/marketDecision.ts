import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически за подписью контракта {@link ContractNames._marketplace | маркетплейса}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: ContractNames._marketplace },
] as const

/**
 * Имя действия
 */
export const actionName = 'change'

/**
 * @interface
 * Действие поставляет в совет на голосование заявления на взнос и возврат взноса двух пайщиков целевой потребительской программы маркетплейса.
 * @private
 */
export type IMarketDecision = Soviet.IChange
