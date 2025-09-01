import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'

/**
 * Получает кошелек капитализации пользователя
 * @param blockchain экземпляр блокчейна
 * @param coopname название кооператива
 * @param username имя пользователя
 * @returns кошелек капитализации или null если не найден
 */
export async function getCapitalWallet(
  blockchain: Blockchain,
  coopname: string,
  username: string,
) {
  const capitalWallets = await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'capwallets',
    100,
    username,
    username,
    2, // by_username index
  )

  return capitalWallets[0] || null
}
