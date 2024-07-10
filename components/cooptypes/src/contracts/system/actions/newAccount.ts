import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as System from '../../../interfaces/system'

export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._system }, { permissions: [Permissions.active], actor: ContractNames._registrator },
] as const

/**
 * Имя действия
 */
export const actionName = 'newaccount'

/**
 * @interface
 */
export type INewAccount = System.INewaccount
