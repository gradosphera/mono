import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, type ValueTypes } from "../../zeus";

export const rawBlockchainActionSelector = {
  account: true,
  account_ram_deltas: {
    account: true,
    delta: true,
  },
  action_ordinal: true,
  authorization: {
    actor: true,
    permission: true,
  },
  block_id: true,
  block_num: true,
  chain_id: true,
  console: true,
  context_free: true,
  creator_action_ordinal: true,
  data: true,
  elapsed: true,
  global_sequence: true,
  name: true,
  receipt: {
    abi_sequence: true,
    act_digest: true,
    auth_sequence: {
      account: true,
      sequence: true,
    },
    code_sequence: true,
    global_sequence: true,
    receiver: true,
    recv_sequence: true,
  },
  receiver: true,
  transaction_id: true,
};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['BlockchainAction']> = rawBlockchainActionSelector;

export const blockchainActionSelector = Selector("BlockchainAction")(
  rawBlockchainActionSelector,
);
