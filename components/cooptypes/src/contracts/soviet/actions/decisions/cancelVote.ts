import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью {@link Actors._member | члена совета}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: Actors._member },
] as const

/**
 * Имя действия
 */
export const actionName = 'cancelvote'

/**
 * @interface
 * Принимает отмену голоса. Метод позволяет члену совета отменить свой голос, если решение еще не принято.
 */
export type IVoteAgainstDecision = Soviet.IVoteagainst
