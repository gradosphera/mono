import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
import { api } from '../api'

export function useLoginUser() {
  async function login(username: string, wif: string): Promise<void> {
    const user = await api.loginUser(username, wif)
    const globalStore = useGlobalStore()
    await globalStore.setWif(username, wif)
    await globalStore.setTokens(user.tokens)

    const session = useSessionStore()
    await session.init()
  }

  return {
    login,
  }
}
