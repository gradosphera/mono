import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import * as Actors from '../../../../common/actors'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется за подписью провайдера для конвертации RUB в AXON.
 */
export const authorizations = [{ permissions: [Permissions.active], actor: Actors._provider }] as const

/**
 * Имя действия
 */
export const actionName = 'converttoaxn'

/**
 * @interface
 * Действие конвертирует RUB в AXON токены с курсом 10:1.
 */
export type IConvertToAxn = Soviet.IConverttoaxn
