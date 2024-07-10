import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью {@link Actors._admin | администратора}.
 */
export const authorizations = [
  { permissions: [Permissions.active, Permissions.special], actor: Actors._admin },
] as const

/**
 * Имя действия
 */
export const actionName = 'regpaid'

/**
 * @interface
 * Действие регистрации получения оплаты вступительного взноса.
 */
export type IRegisterPayment = Soviet.IRegpaid
