import * as Permissions from '../../../common/permissions'
import type * as Token from '../../../interfaces/token'
/**
 * Для выпуска токенов требуется авторизация учетной записи эмитента, указанная в поле issuer при создании токена.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: 'currencyStats.issuer' }] as const

/**
 * Имя действия
 */
export const actionName = 'issue'

/**
 * @interface
 */
export type IIssue = Token.IIssue
