import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

// Селектор для cooperator_account
export const rawCooperatorAccountSelector = {
  announce: true,
  coop_type: true,
  created_at: true,
  description: true,
  document: {
    hash: true,
    public_key: true,
    meta: true,
    signature: true,
  },
  initial: true,
  is_branched: true,
  is_cooperative: true,
  is_enrolled: true,
  meta: true,
  minimum: true,
  org_initial: true,
  org_minimum: true,
  org_registration: true,
  parent_username: true,
  referer: true,
  registered_at: true,
  registration: true,
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

const validateCooperatorAccountSelector = (
  selector: typeof rawCooperatorAccountSelector,
): MakeAllFieldsRequired<ValueTypes["CooperativeOperatorAccount"]> => selector;
validateCooperatorAccountSelector(rawCooperatorAccountSelector);

export const cooperatorAccountSelector = Selector("CooperativeOperatorAccount")(
  rawCooperatorAccountSelector,
);
