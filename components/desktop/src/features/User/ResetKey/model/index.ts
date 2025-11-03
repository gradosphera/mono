import { api, type IResetKeyInput } from '../api'

export function useResetKey() {
  async function resetKey(data: IResetKeyInput): Promise<boolean> {
    return await api.resetKey(data)
  }

  return {
    resetKey
  }
}
