import { defineStore } from 'pinia';
import { useGlobalStore } from 'src/shared/store';
import { computed, ComputedRef, Ref, ref } from 'vue';
import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { FailAlert, readBlockchain } from 'src/shared/api';
import { PrivateKey, Serializer } from '@wharfkit/antelope';
import { GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';
import { env } from 'src/shared/config';
import type { IAccount } from 'src/entities/Account/types';

interface ISessionStore {
  isAuth: Ref<boolean>;
  username: ComputedRef<string>;
  init: () => Promise<void>;
  //TODO add Blockchain Session here
  session: Ref<Session | undefined>;
  close: () => Promise<void>;
  BCInfo: Ref<{
    connected: boolean;
    info: GetInfoResult | undefined;
  }>;
  getInfo: () => Promise<void>;
  loadComplete: Ref<boolean>;
  // Добавляю данные текущего пользователя
  currentUserAccount: Ref<IAccount | undefined>;
  setCurrentUserAccount: (account: IAccount | undefined) => void;
  // Computed свойства для текущего пользователя
  isRegistrationComplete: ComputedRef<boolean>;
  isChairman: ComputedRef<boolean>;
  isMember: ComputedRef<boolean>;
}

export const useSessionStore = defineStore('session', (): ISessionStore => {
  const globalStore = useGlobalStore();
  const isAuth = ref(false);
  const loadComplete = ref(false);
  const currentUserAccount = ref<IAccount | undefined>();

  const session = ref();
  const BCInfo = ref<{
    connected: boolean;
    info: GetInfoResult | undefined;
  }>({ connected: false, info: undefined });

  const getInfo = async () => {
    try {
      const info = await readBlockchain.v1.chain.get_info();
      if (info) {
        BCInfo.value.info = Serializer.objectify(info);
        BCInfo.value.connected = true;
      }
    } catch (e) {
      BCInfo.value = { connected: false, info: undefined };
    }
  };

  const setCurrentUserAccount = (account: IAccount | undefined) => {
    currentUserAccount.value = account;
  };

  const close = async (): Promise<void> => {
    isAuth.value = false;
    session.value = undefined;
    currentUserAccount.value = undefined;
    globalStore.logout();
  };

  const init = async () => {
    if (!globalStore.hasCreditials) {
      await globalStore.init();
      isAuth.value = globalStore.hasCreditials;

      getInfo();

      try {
        if (globalStore.hasCreditials) {
          session.value = new Session({
            actor: globalStore.username,
            permission: 'active',
            chain: {
              id: env.CHAIN_ID as string,
              url: env.CHAIN_URL as string,
            },
            walletPlugin: new WalletPluginPrivateKey(
              globalStore.wif as PrivateKey,
            ),
          });
        }
      } catch (e: any) {
        console.error(e);
        FailAlert(e);
        close();
        globalStore.logout();
      }
    }
  };

  // Компьютед для проверки завершения регистрации пользователя
  const isRegistrationComplete = computed(() =>
    Boolean(
      currentUserAccount.value && currentUserAccount.value.participant_account,
    ),
  );

  const isChairman = computed(
    () => currentUserAccount.value?.provider_account?.role === 'chairman',
  );

  const isMember = computed(
    () => currentUserAccount.value?.provider_account?.role === 'member',
  );

  const username = computed(() => globalStore.username);

  return {
    isAuth,
    init,
    session,
    BCInfo,
    username,
    close,
    getInfo,
    loadComplete,
    currentUserAccount,
    setCurrentUserAccount,
    isRegistrationComplete,
    isChairman,
    isMember,
  };
});
