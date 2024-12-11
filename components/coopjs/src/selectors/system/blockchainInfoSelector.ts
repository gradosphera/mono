import { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { Selector, ValueTypes } from "../../zeus";

// Селектор для blockchain_info
export const rawBlockchainInfoSelector = {
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

const validateBlockchainInfoSelector = (
  selector: typeof rawBlockchainInfoSelector,
): MakeAllFieldsRequired<ValueTypes["BlockchainInfoDTO"]> => selector;
validateBlockchainInfoSelector(rawBlockchainInfoSelector);

export const blockchainInfoSelector = Selector("BlockchainInfoDTO")(
  rawBlockchainInfoSelector,
);
