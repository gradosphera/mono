import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью {@link Actors._system | системного контракта}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: Actors._system },
] as const

/**
 * Имя действия
 */
export const actionName = 'init'

/**
 * @interface
 * Действие добавления администратора.
 */
export type IInit = Soviet.IInit
