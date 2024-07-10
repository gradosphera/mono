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
export const actionName = 'exec'

/**
 * @interface
 * @prop proposer - имя аккаунта, предложившего транзакцию.
 * @prop proposal_name - имя исполняемого предложения.
 * @prop executer - имя аккаунта, исполняющего транзакцию.
 */
export type IExecProposal = Msig.IExec
