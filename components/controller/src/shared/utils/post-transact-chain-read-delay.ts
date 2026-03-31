import config from '~/config/config';

/**
 * Пауза перед чтением таблиц блокчейна сразу после успешной мутации (push_transaction).
 * На узле-последователе строка может появиться в chain state с задержкой относительно ответа RPC.
 */
export async function waitAfterTransactBeforeChainTableRead(): Promise<void> {
  const ms = config.blockchain.post_transact_chain_read_delay_ms;
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) {
    return;
  }
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
