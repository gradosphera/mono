import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

export const rawUserAccountSelector = {
  meta: true,
  referer: true,
  registered_at: true,
  registrator: true,
  status: true,
  storages: true,
  type: true,
  username: true,
  verifications: {
    created_at: true,
    is_verified: true,
    last_update: true,
    notice: true,
    procedure: true,
    verificator: true,
  },
};


// Валидация селекторов
const validate = (
  selector: typeof rawUserAccountSelector,
): MakeAllFieldsRequired<ValueTypes["UserAccount"]> => selector;

validate(rawUserAccountSelector);

export const userAccountSelector = Selector("UserAccount")(
  rawUserAccountSelector,
);

