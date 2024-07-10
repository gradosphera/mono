import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Fund from '../../../interfaces/fund'

export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._soviet }] as const
/**
 * Имя действия
 */

export const actionName = 'authorize'
/**
 * @interface
 */

export type IAuthorize = Fund.IAuthorize
