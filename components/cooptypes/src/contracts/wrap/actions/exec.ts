import * as Permissions from '../../../common/permissions'
import type * as Wrap from '../../../interfaces/wrap'
import { Actors } from '../../../common'

/**
 * Требуется авторизация владельца аккаунта executer.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'exec'

/**
 * @interface
 * @prop executer - аккаунт, выполняющий транзакцию,
 * @prop trx - транзакция, которая должна быть выполнена.
 */
export type IExec = Wrap.IExec
