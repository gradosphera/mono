import * as Permissions from '../../../common/permissions'
import type * as Capital from '../../../interfaces/capital'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._chairman }] as const

/**
 * Имя действия
 */
export const actionName = 'createwthd1'

/**
 * @interface
 */
export type IWithdrawFromResult = Capital.ICreatewthd1
