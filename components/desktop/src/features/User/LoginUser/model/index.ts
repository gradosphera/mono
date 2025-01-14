import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
import { api } from '../api'
import {client} from 'src/shared/api/client'
import { useCurrentUserStore } from 'src/entities/User'
import { useSystemStore } from 'src/entities/System/model'
import { useRegistratorStore } from 'src/entities/Registrator'

export function useLoginUser() {
  const globalStore = useGlobalStore()
  const currentUser = useCurrentUserStore()
  const system = useSystemStore()

  async function login(email: string, wif: string): Promise<void> {
    const auth = await api.loginUser(email, wif)

    await globalStore.setWif(auth.user.username, wif)
    await globalStore.setTokens(auth.tokens)

    const session = useSessionStore()
    await session.init()
    client.setToken(auth.tokens.access.token)

    await currentUser.loadProfile(globalStore.username, system.info.coopname)

    if (!currentUser.isRegistrationComplete){
      const {state, steps} = useRegistratorStore()
      state.userData.type = currentUser.userAccount?.type as 'individual' | 'entrepreneur' | 'organization'
      const privateData = currentUser.userAccount?.private_data || {};

      // Для каждого типа пользователя берём нужное поле и, если оно существует, переносим совпадающие ключи
      const dataMap: Record<string, any> = {
        individual: state.userData.individual_data,
        organization: state.userData.organization_data,
        entrepreneur: state.userData.entrepreneur_data
      };

      const data = dataMap[state.userData.type];
      if (data) {
        for (const key of Object.keys(privateData)) {
          if (key in data) {
            data[key] = privateData[key];
          }
        }
      }

      //continue registration process here
      state.account.username = currentUser.userAccount?.username as string
      state.account.private_key = wif
      state.account.public_key = currentUser.userAccount?.public_key as string

      state.email = currentUser.userAccount?.email as string

      if (currentUser.userAccount?.status === 'created')
        state.step = steps.ReadStatement
      else if (currentUser.userAccount?.status === 'joined')
        state.step = steps.PayInitial
      else if (currentUser.userAccount?.status === 'payed')
        state.step = steps.WaitingRegistration
      else if (currentUser.userAccount?.status === 'registered')
        state.step = steps.Welcome
    }

  }

  return {
    login,
  }
}
