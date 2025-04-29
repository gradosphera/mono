import * as Permissions from '../../../common/permissions'
import type * as Wallet from '../../../interfaces/wallet'
import { Actors } from '../../../common'

/**
 * Имя действия
 * Требуется авторизация {@link Actors._coopname | технического аккаунта кооператива} со специальным разрешением.
 */
export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._coopname }] as const

/**
 * Имя действия
 */
export const actionName = 'createdpst'

/**
 * @interface
 * Действие для создания заявки на взнос в кошелёк, которое производится уполномоченным аккаунтом от кооператива с бэкенда.
 * Создает новую запись депозита в таблице.
 *
 * @prop coopname Имя аккаунта кооператива, в рамках которого создается депозит.
 * @prop username Имя пользователя, создающего запись.
 * @prop type Тип заявки на депозит ('registration' или 'deposit').
 * @prop quantity Количество в формате asset.
 */

export type ICreateDeposit = Wallet.ICreatedpst
