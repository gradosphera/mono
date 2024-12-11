import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { type ValueTypes, Selector } from "../../zeus";

// Селектор для system_account
export const rawSystemAccountSelector = {
  account_name: true,
  core_liquid_balance: true,
  cpu_limit: {
    available: true,
    current_used: true,
    last_usage_update_time: true,
    max: true,
    used: true,
  },
  cpu_weight: true,
  created: true,
  head_block_num: true,
  head_block_time: true,
  last_code_update: true,
  net_limit: {
    available: true,
    current_used: true,
    last_usage_update_time: true,
    max: true,
    used: true,
  },
  net_weight: true,
  permissions: {
    parent: true,
    perm_name: true,
    required_auth: {
      accounts: {
        permission: {
          actor: true,
          permission: true,
        },
        weight: true,
      },
      keys: {
        key: true,
        weight: true,
      },
      threshold: true,
      waits: {
        wait_sec: true,
        weight: true,
      },
    },
  },
  privileged: true,
  ram_quota: true,
  ram_usage: true,
  refund_request: {
    cpu_amount: true,
    net_amount: true,
    owner: true,
    request_time: true,
  },
  rex_info: true,
  self_delegated_bandwidth: {
    cpu_weight: true,
    from: true,
    net_weight: true,
    to: true,
  },
  total_resources: {
    cpu_weight: true,
    net_weight: true,
    owner: true,
    ram_bytes: true,
  },
  voter_info: true,
};
// Валидация селекторов
const validateSystemAccountSelector = (
  selector: typeof rawSystemAccountSelector,
): MakeAllFieldsRequired<ValueTypes["SystemAccount"]> => selector;
validateSystemAccountSelector(rawSystemAccountSelector);

export const systemAccountSelector = Selector("SystemAccount")(
  rawSystemAccountSelector,
);
