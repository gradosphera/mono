import * as Permissions from '../../../common/permissions'
import type * as Registrator from '../../../interfaces/registrator'
import { Actors } from '../../../common'

/**
 * Требуется авторизация аккаунта {@link Actors._admin | администратора} c позитивным балансом AXON для оплаты аренды ресурсов.
 */
export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._admin }] as const

/**
 * Имя действия
 */
export const actionName = 'newaccount'

/**
 * @interface
 */
export type ICreateAccount = Registrator.INewaccount
