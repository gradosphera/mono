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
export const actionName = 'cancel'

/**
 * @interface
 * @prop proposer - имя аккаунта, предложившего транзакцию.
 * @prop proposal_name - имя отменяемого предложения.
 * @prop canceler - имя аккаунта, отменяющего предложение (должен быть либо `proposer`, либо после истечения срока).
 */
export type ICancelProposal = Msig.ICancel
