import * as Permissions from '../../../common/permissions'
import type * as System from '../../../interfaces/system'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'voteupdate'

/**
 * @interface
 * @deprecated
 */
export type IVoteUpdate = System.IVoteupdate
