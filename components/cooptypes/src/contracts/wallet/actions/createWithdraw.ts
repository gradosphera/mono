import * as Permissions from '../../../common/permissions'
import type * as Wallet from '../../../interfaces/wallet'
import { Actors } from '../../../common'

/**
 * Имя действия
 * Требуется авторизация {@link Actors._username | пользователя}.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'createwthd'

/**
 * @interface
 * Действие для создания заявки на возврат паевого взноса из кошелька.
 */
export type ICreateWithdraw = Wallet.ICreatewthd
