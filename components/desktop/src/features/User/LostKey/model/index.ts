import { api, type IStartResetKeyInput } from '../api'

export function useLostKey() {
  async function startResetKey(data: IStartResetKeyInput): Promise<boolean> {
    return await api.startResetKey(data)
  }

  return {
    startResetKey,
  }
}
