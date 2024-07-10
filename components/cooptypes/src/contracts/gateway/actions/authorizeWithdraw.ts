import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Gateway from '../../../interfaces/gateway'

/**
 * Имя действия
 * Требуется авторизация {@link ContractNames._soviet | аккаунта контракта совета}.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._soviet }] as const

/**
 * Имя действия
 */
export const actionName = 'withdrawauth'

/**
 * @interface
 */
export type IAuthorizeWithdraw = Gateway.IWithdrawauth
