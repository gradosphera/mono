import * as Permissions from '../../../common/permissions'
import type * as Branch from '../../../interfaces/branch'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._trustee }] as const

/**
 * Имя действия
 */
export const actionName = 'deltrusted'

/**
 * @interface
 */
export type IDeleteTrusted = Branch.IDeltrusted
