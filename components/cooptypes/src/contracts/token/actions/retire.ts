import * as Permissions from '../../../common/permissions'
import type * as Token from '../../../interfaces/token'

/**
 * Для сжигания токенов требуется авторизация учетной записи эмитента, указанная при создании токена.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: 'currencyStats.issuer' }] as const

/**
 * Имя действия
 */
export const actionName = 'retire'

/**
 * @interface
 */
export type IRetire = Token.IRetire
