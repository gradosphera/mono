import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
import { api } from '../api'
import {client} from 'src/shared/api/client'
import { useCurrentUserStore } from 'src/entities/User'
import { useRegistratorStore } from 'src/entities/Registrator'
import type { ITokens } from 'src/shared/lib/types/user'
import { useInitWalletProcess } from 'src/processes/init-wallet'

export function useLoginUser() {
  const globalStore = useGlobalStore()
  const currentUser = useCurrentUserStore()

  async function login(email: string, wif: string): Promise<void> {
    const auth = await api.loginUser(email, wif);
    const { tokens, account } = await client.login(email, wif);
    // Создаём объект tokens с правильными типами
    const adaptedTokens: ITokens = {
      access: {
        token: tokens.access.token,
        expires: new Date(tokens.access.expires as string),
      },
      refresh: {
        token: tokens.refresh.token,
        expires: new Date(tokens.refresh.expires as string),
      },
    };

    await globalStore.setWif(account.username, wif);
    await globalStore.setTokens(adaptedTokens);

    const session = useSessionStore()
    await session.init()
    client.setToken(auth.tokens.access.token)

    const { run } = useInitWalletProcess()
    await run() //запускаем фоновое обновление кошелька - заменить на подписку потом
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
