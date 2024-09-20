import { getEnvVar } from '../config'
import { getFetch } from './getFetch'

export async function getCurrentBlock(): Promise<number> {
  if (process.env.SKIP_BLOCK_FETCH === 'TRUE')
    return 0

  const blockResponse = await getFetch(`${getEnvVar('SIMPLE_EXPLORER_API')}/get-current-block`)

  const block_num: number = Number(blockResponse)

  if (!block_num)
    throw new Error('Ошибка сервиса получения текущего блока')

  return block_num
}
