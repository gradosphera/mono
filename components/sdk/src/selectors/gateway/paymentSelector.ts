import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes, type ModelTypes } from '../../zeus/index'

// Сырой селектор для PaymentDTO
export const rawPaymentSelector = {
  id: true,
  coopname: true,
  username: true,
  hash: true,
  outcome_hash: true,
  income_hash: true,
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
  type_label: true,
  can_change_status: true,
}

// Валидация селектора
const _validate: MakeAllFieldsRequired<ValueTypes['GatewayPayment']> = rawPaymentSelector

/**
 * Селектор для универсального платежа
 */
export const paymentSelector = Selector('GatewayPayment')(rawPaymentSelector)

export type PaymentType = ModelTypes['GatewayPayment']
