import { DraftContract } from 'cooptypes/index'
import { getEnvVar } from '../config'
import { getFetch } from './getFetch'

export async function getDraftFromDeltas(registry_id: string | number): Promise<DraftContract.Tables.Drafts.IDraft> {
  const draftResponse = (await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-delta`, new URLSearchParams({
    filter: JSON.stringify({
      'code': DraftContract.contractName.production,
      'scope': DraftContract.contractName.production,
      'table': DraftContract.Tables.Drafts.tableName,
      'value.registry_id': String(registry_id),
    }),
    limit: String(1),
  })))?.results[0] as DraftContract.Tables.Drafts.IDraft

  if (!draftResponse)
    throw new Error('Ошибка получения шаблона из блокчейна')

  return draftResponse
}
