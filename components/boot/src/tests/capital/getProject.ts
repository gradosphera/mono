import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { makeCombinedChecksum256NameIndexKey } from '../shared/combinedKeys'

export async function getProject(blockchain: Blockchain, coopname: string, project_hash: string): Promise<CapitalContract.Tables.Projects.IProject> {
  const rows = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    CapitalContract.Tables.Projects.tableName,
    1000,
    project_hash,
    project_hash,
    3,
    'sha256',
  ))

  return rows[0]
}
