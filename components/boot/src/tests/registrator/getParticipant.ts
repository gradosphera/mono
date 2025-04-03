import { SovietContract } from 'cooptypes'
import type Blockchain from '../../blockchain'

export async function getParticipant(
  blockchain: Blockchain,
  coopname: string,
  username: string,
) {
  const participant = (await blockchain.getTableRows(
    SovietContract.contractName.production,
    'voskhod',
    'participants',
    1,
    username,
    username,
  ))[0]

  return participant
}
