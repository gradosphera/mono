import * as Permissions from '../../../common/permissions'
import type * as Ledger from '../../../interfaces/ledger'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._contract }] as const

/**
 * Имя действия
 */
export const actionName = 'unblock'

/**
 * @interface
 */
export type IUnblock = Ledger.IUnblock
