import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

/**
 * Действие выполняется за подписью {@link Actors._member | члена совета}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: Actors._chairman },
] as const

/**
 * Имя действия
 */
export const actionName = 'freedecision'

/**
 * @interface
 * Действие создания проекта решения
 */
export type ICreateFreeDecision = Soviet.IFreedecision
