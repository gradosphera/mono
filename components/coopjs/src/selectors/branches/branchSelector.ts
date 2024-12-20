import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";
import { rawBankAccountSelector } from "../common/bankAccountSelector";
import { rawIndividualSelector } from "../common/individualSelector";
import { rawPaymentMethodSelector } from "../paymentMethods/paymentMethodSelector";
import { rawBankPaymentMethodSelector } from "../paymentMethods/rawBankPaymentMethodSelector";

const rawBranchSelector = {
  coopname: true,
  braname: true,
  city: true,
  country: true,
  details: {
    kpp: true,
    inn: true,
    ogrn: true,
  },
  email: true,
  fact_address: true,
  full_address: true,
  full_name: true,
  phone: true,
  represented_by: {
    based_on: true,
    first_name: true,
    last_name: true,
    middle_name: true,
    position: true,
  },
  short_name: true,
  trusted: rawIndividualSelector, // Передаём "сырой" объект
  trustee: rawIndividualSelector, // Передаём "сырой" объект
  bank_account: rawBankPaymentMethodSelector,
  type: true,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes["Branch"]> = rawBranchSelector;

export const branchSelector = Selector("Branch")(rawBranchSelector);
export { rawBranchSelector };
