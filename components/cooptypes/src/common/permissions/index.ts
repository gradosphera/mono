import type * as Actors from '../actors'

/**
 * Активные разрешения прав доступа аккаунта для выполнения действий.
 */
export const active = 'active'

/**
 * Разрешения прав доступа владельца аккаунта для замены активных разрешений.
 */
export const owner = 'owner'

/**
 * Специальные разрешения прав доступа, которые выдаются советом кооператива аккаунту администратора с указанием контракта и имени действия, которые ему становятся доступны в кооперативе.
 */
export const special = {
  contract: '_contract',
  action: 'actionName',
} as const

/**
 * Интерфейс `Authorization` представляет собой модель авторизации в системе.
 *
 * @property {Array} permissions - Массив разрешений, которые могут быть активными, владельцами или специальными.
 * @property {Actors} actor - Актор, который может быть пользователем, председателем, администратором, контрактом или системным аккаунтом.
 */
export interface Authorization {
  permissions: (typeof active | typeof owner | typeof special)[]
  actor: typeof Actors._username | typeof Actors._chairman | typeof Actors._admin | typeof Actors._contract | typeof Actors._system
}
