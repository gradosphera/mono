import * as Permissions from '../../../common/permissions'
import type * as Gateway from '../../../interfaces/gateway'
import { Actors } from '../../../common'

/**
 * Имя действия
 * Требуется авторизация {@link Actors._admin | администратора}.
 */
export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._admin }] as const

/**
 * Имя действия
 */
export const actionName = 'outcomplete'

export type ICompleteOutcome = Gateway.IOutcomplete
