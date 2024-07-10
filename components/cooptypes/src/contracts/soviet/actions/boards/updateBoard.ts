import * as Permissions from '../../../../common/permissions'
import type * as Soviet from '../../../../interfaces/soviet'
import { Actors } from '../../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._chairman }] as const

/**
 * Имя действия
 */
export const actionName = 'updateboard'

/**
 * @interface
 * Действие изменения данных доски совета.
 */
export type IUpdateBoard = Soviet.IUpdateboard
