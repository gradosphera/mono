import * as Permissions from '../../../common/permissions'
import type * as Msig from '../../../interfaces/msig'
import { Actors } from '../../../common'

/**
 * Имя действия
 * Требуется авторизация {@link Actors._username | аккаунта пользователя}.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'invalidate'

/**
 * @interface
 */
export type IInvalidateAccount = Msig.IInvalidate
