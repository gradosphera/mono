import * as Permissions from '../../../common/permissions'
import type * as Registrator from '../../../interfaces/registrator'
import { Actors } from '../../../common'

/**
 * Требуется авторизация администратора кооператива или пользователя.
 */
export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._admin }, { permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'joincoop'

/**
 * @interface
 */
export type IJoinCooperative = Registrator.IJoincoop
