import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Draft from '../../../interfaces/draft'

export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._system }] as const

/**
 * Имя действия
 */
export const actionName = 'deldraft'

/**
 * @interface
 */
export type IDeleteDraft = Draft.IDeldraft
