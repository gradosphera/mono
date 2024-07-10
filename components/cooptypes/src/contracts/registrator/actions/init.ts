import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Registrator from '../../../interfaces/registrator'

export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._system }] as const

/**
 * Имя действия
 */
export const actionName = 'init'

/**
 * @interface
 */
export type IInit = Registrator.IInit
