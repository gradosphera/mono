import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

const rawBankAccountSelector = {
  details: {
    bik: true,
    corr: true,
    kpp: true,
  },
  account_number: true,
  bank_name: true,
  card_number: true,
  currency: true,
};

// Проверяем валидность
const validateBankAccountSelector = (selector: typeof rawBankAccountSelector): MakeAllFieldsRequired<ValueTypes['BankAccount']> => selector;
validateBankAccountSelector(rawBankAccountSelector);

export const bankAccountSelector = Selector('BankAccount')(rawBankAccountSelector);
export { rawBankAccountSelector };
