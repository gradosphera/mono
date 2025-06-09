import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Meet from '../../../interfaces/meet'

export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._system }] as const

/**
 * Имя действия
 */
export const actionName = 'gmnotify'

/**
 * @interface
 */
export type IInput = Meet.IGmnotify
