import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawBankAccountSelector } from "../common/bankAccountSelector";

const rawPaymentMethodSelector = {
  data: {
    __typename: true,
    ["...on BankAccount"]: rawBankAccountSelector,
    ["...on SbpAccount"]: {
      phone: true,
    },
  },
  is_default: true,
  created_at: true,
  updated_at: true,
  method_id: true,
  method_type: true,
  username: true,
};

// Проверяем валидность
const validateSelector = (selector: typeof rawPaymentMethodSelector): MakeAllFieldsRequired<ValueTypes['PaymentMethod']> => selector;
validateSelector(rawPaymentMethodSelector);

export const paymentMethodSelector = Selector('PaymentMethod')(rawPaymentMethodSelector);
export { rawPaymentMethodSelector };
