import * as Permissions from '../../../common/permissions'
import type * as Fund from '../../../interfaces/fund'
import { Actors } from '../../../common'

/**
 * Требуется авторизация {@link Actors._username | аккаунта пользователя} для возврата паевого взноса,
 * авторизация {@link Actors._admin | аккаунта администратора} со специальной доверенностью совета
 * на совершение действия или авторизация любого {@link Actors._contract | контракта},
 * которому было передано управление фондом накопления или списания.
 */

export const authorizations = [
  { permissions: [Permissions.active], actor: Actors._username },
  { permissions: [Permissions.active, Permissions.special], actor: Actors._admin },
  { permissions: [Permissions.active], actor: Actors._contract },
] as const
/**
 * Имя действия
 */

export const actionName = 'fundwithdraw'
/**
 * @interface
 */

export type ICreateWithdraw = Fund.IFundwithdraw
