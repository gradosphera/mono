import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { api } from '../api';
import { client } from 'src/shared/api/client';
import { useRegistratorStore } from 'src/entities/Registrator';
import type { ITokens } from 'src/shared/lib/types/user';
import { useInitWalletProcess } from 'src/processes/init-wallet';
import type { Zeus } from '@coopenomics/sdk';

export function useLoginUser() {
  const globalStore = useGlobalStore();
  const session = useSessionStore();

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

    await session.init();
    client.setToken(auth.tokens.access.token);

    const { run } = useInitWalletProcess();
    await run(); //запускаем фоновое обновление кошелька - заменить на подписку потом
    if (!session.isRegistrationComplete) {
      const { state, steps } = useRegistratorStore();
      state.userData.type = session?.privateAccount?.type as Zeus.AccountType;
      const privateData = session?.privateAccount;

      // Для каждого типа пользователя берём нужное поле и, если оно существует, переносим совпадающие ключи
      const dataMap = {
        individual: privateData?.individual_data,
        organization: privateData?.organization_data,
        entrepreneur: privateData?.entrepreneur_data,
      };

      const data = dataMap[state.userData.type];
      if (data) {
        Object.keys(data).forEach((key) => {
          if (key in state.userData) {
            (state.userData as any)[key] = (data as any)[key];
          }
        });
      }

      //continue registration process here
      state.account.username = session.username as string;
      state.account.private_key = wif;
      state.account.public_key = session.providerAccount
        ?.public_key as string;

      state.email = session.providerAccount?.email as string;

      // Статус берем из userAccount, не providerAccount
      const userStatus = session.userAccount?.status;
      if (userStatus === 'created') state.step = steps.ReadStatement;
      else if (userStatus === 'joined') state.step = steps.PayInitial;
      else if (userStatus === 'payed') state.step = steps.WaitingRegistration;
      else if (userStatus === 'registered') state.step = steps.Welcome;
    }
  }

  return {
    login,
  };
}
