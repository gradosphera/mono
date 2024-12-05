import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

// Селектор для system_account
const rawSystemAccountSelector = {
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

// Селектор для blockchain_info
const rawBlockchainInfoSelector = {
  block_cpu_limit: true,
  block_net_limit: true,
  chain_id: true,
  fork_db_head_block_id: true,
  fork_db_head_block_num: true,
  head_block_id: true,
  head_block_num: true,
  head_block_producer: true,
  head_block_time: true,
  last_irreversible_block_id: true,
  last_irreversible_block_num: true,
  last_irreversible_block_time: true,
  server_version: true,
  server_version_string: true,
  virtual_block_cpu_limit: true,
  virtual_block_net_limit: true,
};

// Селектор для cooperator_account
const rawCooperatorAccountSelector = {
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

// Валидация селекторов
const validateSystemAccountSelector = (selector: typeof rawSystemAccountSelector): MakeAllFieldsRequired<ValueTypes['SystemAccount']> => selector;
validateSystemAccountSelector(rawSystemAccountSelector);

const validateBlockchainInfoSelector = (selector: typeof rawBlockchainInfoSelector): MakeAllFieldsRequired<ValueTypes['BlockchainInfo']> => selector;
validateBlockchainInfoSelector(rawBlockchainInfoSelector);

const validateCooperatorAccountSelector = (selector: typeof rawCooperatorAccountSelector): MakeAllFieldsRequired<ValueTypes['CooperatorAccount']> => selector;
validateCooperatorAccountSelector(rawCooperatorAccountSelector);

// Экспортируем селекторы
export const systemAccountSelector = Selector('SystemAccount')(rawSystemAccountSelector);
export const blockchainInfoSelector = Selector('BlockchainInfo')(rawBlockchainInfoSelector);
export const cooperatorAccountSelector = Selector('CooperatorAccount')(rawCooperatorAccountSelector);

export { rawSystemAccountSelector, rawBlockchainInfoSelector, rawCooperatorAccountSelector };
