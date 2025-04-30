import { defineStore } from 'pinia';
import { useGlobalStore } from 'src/shared/store';
import { computed, ComputedRef, Ref, ref } from 'vue';
import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { FailAlert, readBlockchain } from 'src/shared/api';
import { PrivateKey, Serializer } from '@wharfkit/antelope';
import { GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';
import { env } from 'src/shared/config';
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
}

export const useSessionStore = defineStore('session', (): ISessionStore => {
  const globalStore = useGlobalStore();
  const isAuth = ref(false);
  const loadComplete = ref(false);

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

  const close = async (): Promise<void> => {
    isAuth.value = false;
    session.value = undefined;
    globalStore.logout()
  };

  const init = async () => {
    if (!globalStore.hasCreditials){

      await globalStore.init();
      isAuth.value = globalStore.hasCreditials;

      getInfo();

      try {

        if (globalStore.hasCreditials){

          session.value = new Session({
            actor: globalStore.username,
            permission: 'active',
            chain: {
              id: env.CHAIN_ID as string,
              url: env.CHAIN_URL as string,
            },
            walletPlugin: new WalletPluginPrivateKey(
              globalStore.wif as PrivateKey
            ),
          });
        }
      } catch (e: any) {
        console.error(e);
        FailAlert(e.message);
        close()
        globalStore.logout()
      }
    }
  };

  const username = computed(() => globalStore.username);

  return {
    isAuth,
    init,
    session,
    BCInfo,
    username,
    close,
    getInfo,
    loadComplete
  };
});
