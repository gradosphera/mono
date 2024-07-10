import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Marketplace from '../../../interfaces/marketplace'

/**
 * Имя действия
 * Требуется авторизация {@link ContractNames._marketplace | аккаунта контракта маркетплейса}.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._marketplace }] as const

/**
 * Имя действия
 */
export const actionName = 'newid'

/**
 * @interface
 * @private
 */
export type INewRequestId = Marketplace.INewid
