/**
 * Доменный интерфейс для действия блокчейна
 */
export interface ActionDomainInterface {
  id: string;
  transaction_id: string;
  account: string;
  block_num: number;
  block_id: string;
  chain_id: string;
  name: string;
  receiver: string;
  authorization: Array<{
    actor: string;
    permission: string;
  }>;
  data: any;
  action_ordinal: number;
  global_sequence: string;
  account_ram_deltas: Array<{
    account: string;
    delta: number;
  }>;
  console?: string;
  receipt: {
    receiver: string;
    act_digest: string;
    global_sequence: string;
    recv_sequence: string;
    auth_sequence: Array<{
      account: string;
      sequence: string;
    }>;
    code_sequence: number;
    abi_sequence: number;
  };
  creator_action_ordinal: number;
  context_free: boolean;
  elapsed: number;
  repeat?: boolean;
  created_at: Date;
}
