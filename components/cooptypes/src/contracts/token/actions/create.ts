import * as Permissions from '../../../common/permissions'
import type * as Token from '../../../interfaces/token'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._system }] as const

/**
 * Имя действия
 */
export const actionName = 'create'

/**
 * @interface
 */
export type ICreate = Token.ICreate
