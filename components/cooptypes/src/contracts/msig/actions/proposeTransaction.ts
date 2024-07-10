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
export const actionName = 'propose'

/**
 * @interface
 * @prop proposer - имя аккаунта, создающего предложение.
 * @prop proposal_name - уникальное имя предложения.
 * @prop requested - массив уровней разрешений для одобрения предложения.
 * @prop trx - сериализованная транзакция для предложения.
 */
export type IProposeTransaction = Msig.IPropose
