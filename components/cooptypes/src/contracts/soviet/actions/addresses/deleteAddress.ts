import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью {@link Actors._chairman | председателя}.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: Actors._chairman }] as const

/**
 * Имя действия
 */
export const actionName = 'deladdress'

/**
 * @interface
 * Действие удаляет адресс.
 */
export type IDeleteAddress = Soviet.IDeladdress
