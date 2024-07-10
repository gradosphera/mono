import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически за подписью контракта {@link ContractNames._registrator | шлюза}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: ContractNames._registrator },
] as const

/**
 * Имя действия
 */
export const actionName = 'joincoop'

/**
 * @interface
 * Действие поставляет в совет на голосование заявление на вступление в кооператив.
 * @private
 */
export type IJoinCoopDecision = Soviet.IJoincoop
