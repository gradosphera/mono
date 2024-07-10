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
export const actionName = 'disautomate'

/**
 * @interface
 * Отключает автоматизацию принятия решений по указанным типам вопросов на повестке для члена совета.
 */
export type IDisautomate = Soviet.IDisautomate
