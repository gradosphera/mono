import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Gateway from '../../../interfaces/gateway'

/**
 * Имя действия
 * Требуется авторизация {@link ContractNames._gateway | аккаунта контракта шлюза}.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._gateway }] as const

/**
 * Имя действия
 */
export const actionName = 'newdepositid'

/**
 * @interface
 */
export type NewDepositId = Gateway.INewdepositid
