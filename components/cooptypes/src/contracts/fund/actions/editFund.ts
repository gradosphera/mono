import * as Permissions from '../../../common/permissions'
import type * as Fund from '../../../interfaces/fund'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._chairman }] as const
/**
 * Имя действия
 */

export const actionName = 'editfund'
/**
 * @interface
 */

export type IEditFund = Fund.IEditfund
