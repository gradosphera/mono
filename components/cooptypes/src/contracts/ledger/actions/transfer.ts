import * as Permissions from '../../../common/permissions'
import type * as Ledger from '../../../interfaces/ledger'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._contract }] as const

/**
 * Имя действия
 */
export const actionName = 'transfer'

/**
 * @interface
 */
export type ITransfer = Ledger.ITransfer
