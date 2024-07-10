import * as Permissions from '../../../common/permissions'
import type * as Fund from '../../../interfaces/fund'
import * as Actors from '../../../common/actors'

export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._admin }] as const
/**
 * Имя действия
 */

export const actionName = 'complete'
/**
 * @interface
 */

export type ICompleteWithdraw = Fund.IComplete
