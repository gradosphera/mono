import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

export const rawMonoAccountSelector = {
  email: true,
  has_account: true,
  initial_order: true,
  is_email_verified: true,
  is_registered: true,
  message: true,
  public_key: true,
  referer: true,
  role: true,
  status: true,
  type: true,
  username: true,
};

// Валидация селекторов
const validateSystemAccountSelector = (
  selector: typeof rawMonoAccountSelector,
): MakeAllFieldsRequired<ValueTypes["MonoAccount"]> => selector;
validateSystemAccountSelector(rawMonoAccountSelector);

export const monoAccountSelector = Selector("MonoAccount")(
  rawMonoAccountSelector,
);

