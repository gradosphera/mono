import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes, type ModelTypes } from '../../zeus/index'
import { rawUserCertificateUnionSelector } from '../common'

// Селектор для PaymentDetailsDTO
export const rawPaymentDetailsSelector = {
  data: true,
  amount_plus_fee: true,
  amount_without_fee: true,
  fee_amount: true,
  fee_percent: true,
  fact_fee_percent: true,
  tolerance_percent: true,
}

// Сырой селектор для GatewayPaymentDTO
export const rawPaymentSelector = {
  id: true,
  hash: true,
  coopname: true,
  username: true,
  username_certificate: rawUserCertificateUnionSelector,
  quantity: true,
  symbol: true,
  type: true,
  direction: true,
  status: true,
  provider: true,
  payment_method_id: true,
  message: true,
  memo: true,
  expired_at: true,
  created_at: true,
  updated_at: true,
  payment_details: rawPaymentDetailsSelector,
  blockchain_data: true,
  statement: true,
  // Поля для обратной совместимости
  outcome_hash: true,
  income_hash: true,
  // Вычисляемые поля
  formatted_amount: true,
  status_label: true,
  type_label: true,
  direction_label: true,
  can_change_status: true,
  is_final: true,
}

// Валидация селектора
const _validate: MakeAllFieldsRequired<ValueTypes['GatewayPayment']> = rawPaymentSelector

/**
 * Селектор для универсального платежа Gateway
 */
export const paymentSelector = Selector('GatewayPayment')(rawPaymentSelector)

export type PaymentType = ModelTypes['GatewayPayment']
