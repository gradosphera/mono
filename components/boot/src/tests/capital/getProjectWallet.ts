import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'

/**
 * Получает кошелек проекта пользователя
 * @param blockchain экземпляр блокчейна
 * @param coopname название кооператива
 * @param projectHash хеш проекта
 * @param username имя пользователя
 * @returns кошелек проекта или null если не найден
 */
export async function getProjectWallet(
  blockchain: Blockchain,
  coopname: string,
  projectHash: string,
  username: string,
) {
  const projectWallets = await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projwallets',
    100,
    username,
    username,
    3, // by_username index
  )

  // Ищем кошелек для конкретного проекта
  return projectWallets.find((wallet: any) => wallet.project_hash === projectHash) || null
}
