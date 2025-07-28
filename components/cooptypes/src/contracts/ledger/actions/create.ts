import * as Permissions from '../../../common/permissions'
import type * as Ledger from '../../../interfaces/ledger'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'create'

/**
 * @interface
 */
export type ICreate = Ledger.ICreate
