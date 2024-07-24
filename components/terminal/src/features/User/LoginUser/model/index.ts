import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
import { api } from '../api'

export function useLoginUser() {
  async function login(email: string, wif: string): Promise<void> {
    const auth = await api.loginUser(email, wif)
    const globalStore = useGlobalStore()
    await globalStore.setWif(auth.user.username, wif)
    await globalStore.setTokens(auth.tokens)

    const session = useSessionStore()
    await session.init()
  }

  return {
    login,
  }
}
