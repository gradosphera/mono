import * as Permissions from '../../../common/permissions'
import type * as Gateway from '../../../interfaces/gateway'
import { Actors } from '../../../common'

/**
 * Имя действия
 * Требуется авторизация {@link Actors._coopname | технического аккаунта кооператива} со специальным разрешением.
 */
export const authorizations = [{ permissions: [Permissions.active, Permissions.special], actor: Actors._coopname }] as const

/**
 * Имя действия
 */
export const actionName = 'createincome'

export type ICreateIncome = Gateway.ICreateinpay
