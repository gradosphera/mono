import { getEnvVar } from '../config'
import { getFetch } from './getFetch'
import { postFetch } from './postFetch'

export async function getCurrentBlock(): Promise<number> {
  if (process.env.SKIP_BLOCK_FETCH === 'TRUE')
    return 0

  const url = process.env.BLOCKCHAIN_RPC as string
  const data = await postFetch(`${url}/v1/chain/get_info`, {})
  const block_num: number = Number(data.head_block_num)

  if (!block_num)
    throw new Error('Ошибка сервиса получения текущего блока')

  return block_num
}
