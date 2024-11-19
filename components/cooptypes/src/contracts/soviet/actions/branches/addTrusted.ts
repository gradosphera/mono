import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._trustee }] as const

/**
 * Имя действия
 */
export const actionName = 'addtrusted'

/**
 * @interface
 */
export type IAddTrusted = Soviet.IAddtrusted
