import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes, type ModelTypes } from '../../zeus/index'

// Сырой селектор для OutgoingPaymentDTO
export const rawOutgoingPaymentSelector = {
  id: true,
  coopname: true,
  username: true,
  hash: true,
  quantity: true,
  symbol: true,
  method_id: true,
  status: true,
  type: true,
  created_at: true,
  updated_at: true,
  memo: true,
  payment_details: true,
  blockchain_data: true,
  formatted_amount: true,
  status_label: true,
  can_change_status: true,
}

// Валидация селектора
const _validate: MakeAllFieldsRequired<ValueTypes['OutgoingPayment']> = rawOutgoingPaymentSelector

/**
 * Селектор для исходящего платежа
 */
export const outgoingPaymentSelector = Selector('OutgoingPayment')(rawOutgoingPaymentSelector)

export type OutgoingPaymentType = ModelTypes['OutgoingPayment']
