import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, ValueTypes } from "../../zeus";

// Селектор для payment details
export const rawPaymentDetailsSelector = {
  amount_plus_fee: true,
  amount_without_fee: true,
  data: true,
  fact_fee_percent: true,
  fee_amount: true,
  fee_percent: true,
  tolerance_percent: true,
};

// Селектор для payment
export const rawPaymentSelector = {
  amount: true,
  blockchain_id: true,
  created_at: true,
  details: rawPaymentDetailsSelector,
  expired_at: true,
  id: true,
  message: true,
  provider: true,
  status: true,
  symbol: true,
  updated_at: true,
  username: true,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Payment']> = rawPaymentSelector;

export const paymentSelector = Selector("Payment")(rawPaymentSelector);