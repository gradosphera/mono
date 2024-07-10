import * as Permissions from '../../../common/permissions'
import type * as Marketplace from '../../../interfaces/marketplace'
import { Actors } from '../../../common'

/**
 * Имя действия
 * Требуется авторизация {@link Actors._admin | аккаунта администратора}.
 */
export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._admin }] as const

/**
 * Имя действия
 */
export const actionName = 'moderate'

/**
 * @interface
 */
export type IModerateRequest = Marketplace.IModerate
