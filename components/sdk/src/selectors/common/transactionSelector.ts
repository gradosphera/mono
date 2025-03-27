import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type GraphQLTypes, type InputType, Selector, type ValueTypes } from '../../zeus/index'

// Определяем объект вручную, чтобы избежать потери типов
export const rawTransactionSelector = {
  chain: true,
  request: true,
  resolved: true,
  response: true,
  returns: true,
  revisions: true,
  signatures: true,
  signer: true,
  transaction: true,
}

// Проверяем raw на соответствие типу
const _validate: MakeAllFieldsRequired<ValueTypes['Transaction']>
  = rawTransactionSelector

// Передаём raw в селектор
export const generateTransactionSelector = Selector('Transaction')(rawTransactionSelector)
