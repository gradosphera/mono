import * as Permissions from '../../../common/permissions'
import type * as System from '../../../interfaces/system'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._username }] as const

/**
 * Имя действия
 */
export const actionName = 'regproducer2'

/**
 * @interface
 */
export type IRegisterProducer2 = System.IRegproducer2
