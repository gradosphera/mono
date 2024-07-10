import { DraftContract } from 'cooptypes/index'
import { getEnvVar } from '../config'
import { getFetch } from './getFetch'

export async function getTranslationFromDeltas(draft_id: string | number, lang: string): Promise<DraftContract.Tables.Translations.ITranslation> {
  const draftResponse = (await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-delta`, new URLSearchParams({
    filter: JSON.stringify({
      'code': DraftContract.contractName.production,
      'scope': DraftContract.contractName.production,
      'table': DraftContract.Tables.Translations.tableName,
      'value.draft_id': String(draft_id),
      'value.lang': lang,
    }),
    limit: String(1),
  })))?.results[0] as DraftContract.Tables.Translations.ITranslation

  if (!draftResponse)
    throw new Error('Ошибка получения шаблона из блокчейна')

  return draftResponse
}
