import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически по ходу работы системы за подписью одного из контрактов: {@link ContractNames._soviet | совета} или {@link ContractNames._marketplace | маркетплейса}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: ContractNames._soviet },
  { permissions: [Permissions.active], actor: ContractNames._marketplace },
] as const

/**
 * Имя действия
 */
export const actionName = 'subprogbal'

/**
 * @interface
 * @private
 * Действие списывает баланс токенов учёта из целевой потребительской программы кооператива.
 */
export type ISubProgramBalance = Soviet.ISubprogbal
