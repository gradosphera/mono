import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
// import { api } from '../api'
import { useCurrentUserStore } from 'src/entities/User'
import { useRegistratorStore } from 'src/entities/Registrator'

export function useLogoutUser() {
  async function logout(): Promise<void> {
    const global = useGlobalStore()
    //TODO: "начать с начала" при регистрации бажит на это - да и в целом пора бы маршруты срезать эти
    console.log('logout')
    // if (global.tokens?.refresh.token) await api.logoutUser(global.tokens?.refresh.token)
    await useRegistratorStore().clearUserData()

    await global.logout()

    useSessionStore().close()
    useCurrentUserStore().clearAccount()
    console.log('logout done')
  }

  return {
    logout,
  }
}
