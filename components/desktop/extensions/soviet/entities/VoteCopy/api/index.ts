import { client } from 'src/shared/api/client'
import { Queries } from '@coopenomics/sdk'
import type { IVoteCopyMySetting, IVoteCopyToMe } from '../model/types'

async function loadMyVoteCopySettings(): Promise<IVoteCopyMySetting[]> {
  const { [Queries.Soviet.GetMyVoteCopySettings.name]: output } = await client.Query(
    Queries.Soviet.GetMyVoteCopySettings.query,
  )
  return output
}

async function loadWhoCopiesToMe(): Promise<IVoteCopyToMe[]> {
  const { [Queries.Soviet.GetWhoCopiesToMe.name]: output } = await client.Query(
    Queries.Soviet.GetWhoCopiesToMe.query,
  )
  return output
}

export const api = {
  loadMyVoteCopySettings,
  loadWhoCopiesToMe,
}
