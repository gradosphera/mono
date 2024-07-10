import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Draft from '../../../interfaces/draft'

export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._draft }] as const

/**
 * Имя действия
 */
export const actionName = 'newid'

/**
 * @interface
 * Действие вызывается контрактом в процессе исполнения для возврата идентификатора черновика.
 */
export type INewId = Draft.INewid
