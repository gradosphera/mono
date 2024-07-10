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
export const actionName = 'votefor'

/**
 * @interface
 * Принимает голос "ПРОТИВ" от члена совета по повестке собрания.
 */
export type IVoteForDecision = Soviet.IVotefor
