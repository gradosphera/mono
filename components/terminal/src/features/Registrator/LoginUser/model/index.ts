import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
import { api } from '../api'

export function useLoginUser() {
  const globalStore = useGlobalStore()

  async function login(email: string, wif: string): Promise<void> {
    const auth = await api.loginUser(email, wif)

    await globalStore.setWif(auth.user.username, wif)
    await globalStore.setTokens(auth.tokens)

    const session = useSessionStore()
    await session.init()
  }

  return {
    login,
  }
}
