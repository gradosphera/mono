import { rawBankAccountSelector } from "../common/bankAccountSelector";

export const rawbankPaymentMethodSelector = {
  data: rawBankAccountSelector,
  is_default: true,
  created_at: true,
  updated_at: true,
  method_id: true,
  method_type: true,
  username: true,
};
