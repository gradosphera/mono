import * as Permissions from '../../../common/permissions'
import type * as System from '../../../interfaces/system'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._contract }] as const

/**
 * Имя действия
 */
export const actionName = 'setcode'

/**
 * @interface
 */
export type ISetCode = System.ISetcode
