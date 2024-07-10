import * as Permissions from '../../../common/permissions'
import * as ContractNames from '../../../common/names'
import type * as Registrator from '../../../interfaces/registrator'

/**
 * Требуется подпись контракта {@link ContractNames._soviet | совета}, которая поставляется автоматически в момент исполнения решения совета о приёме нового пайщика.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: ContractNames._soviet }] as const

/**
 * Имя действия
 */
export const actionName = 'confirmreg'

/**
 * @interface
 */
export type IConfirmJoin = Registrator.IConfirmreg
