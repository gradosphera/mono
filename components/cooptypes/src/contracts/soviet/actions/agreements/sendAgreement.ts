import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью любого {@link Actors._username | пользователя}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: Actors._username },
] as const

/**
 * Имя действия
 */
export const actionName = 'sndagreement'

/**
 * Действие отправки заявления на присоединение к ЦПП кооператива
 */
export type ISendAgreement = Soviet.ISndagreement
