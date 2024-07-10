import * as Permissions from '../../../../common/permissions'
import * as ContractNames from '../../../../common/names'
import type * as Soviet from '../../../../interfaces/soviet'

/**
 * Действие выполняется автоматически за подписью контракта {@link ContractNames._marketplace | маркетплейса}.
 */
export const authorizations = [
  { permissions: [Permissions.active], actor: ContractNames._marketplace },
] as const

/**
 * Имя действия
 */
export const actionName = 'recieved'

/**
 * @interface
 * Действие поставляет в совет информацию о завершении процесса клиринга и инициирует выпуск закрывающих документов в реестр.
 * @private
 */
export type IProductRecieved = Soviet.IRecieved
