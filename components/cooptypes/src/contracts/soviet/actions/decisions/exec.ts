import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью любого {@link Actors._username | пользователя}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: Actors._username },
] as const

/**
 * Имя действия
 */
export const actionName = 'exec'

/**
 * @interface
 * Действие исполнения принятого решения.
 * Обычно вызывается председателем сразу после утверждения решения,
 * чтобы оно вступило в силу и контракты исполнили его.
 * Однако, любой пользователь/кооператив может вызвать исполнение решения после того,
 * как оно было принято советом, если председатель по-какой-либо причине не исполнил его сам.
 */
export type IExec = Soviet.IExec
