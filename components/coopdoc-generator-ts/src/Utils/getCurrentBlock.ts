import { getEnvVar } from '../config'
import { getFetch } from './getFetch'

export async function getCurrentBlock(): Promise<number> {
  const blockResponse = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-current-block`)

  const block_num: number = Number(blockResponse)

  if (!block_num)
    throw new Error('Ошибка сервиса получения текущего блока')

  return block_num
}
