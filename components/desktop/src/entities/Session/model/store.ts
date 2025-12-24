import { defineStore } from 'pinia';
import { useGlobalStore } from 'src/shared/store';
import { computed, ComputedRef, Ref, ref } from 'vue';
import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { FailAlert } from 'src/shared/api';
import { PrivateKey } from '@wharfkit/antelope';
import { env } from 'src/shared/config';
import type { IAccount } from 'src/entities/Account/types';
import { useDisplayName } from 'src/shared/lib/composables/useDisplayName';

interface ISessionStore {
  isAuth: Ref<boolean>;
  username: ComputedRef<string>;
  displayName: ComputedRef<string>;
  init: () => Promise<void>;
  //TODO add Blockchain Session here
  session: Ref<Session | undefined>;
  close: () => Promise<void>;
  loadComplete: Ref<boolean>;
  // Добавляю данные текущего пользователя
  currentUserAccount: Ref<IAccount | undefined>;
  setCurrentUserAccount: (account: IAccount | undefined) => void;
  clearAccount: () => void;
  // Computed свойства для текущего пользователя
  isRegistrationComplete: ComputedRef<boolean>;
  isChairman: ComputedRef<boolean>;
  isMember: ComputedRef<boolean>;
  // Удобные геттеры для различных типов данных
  userAccount: ComputedRef<IAccount['user_account'] | undefined>;
  privateAccount: ComputedRef<IAccount['private_account'] | undefined>;
  blockchainAccount: ComputedRef<IAccount['blockchain_account'] | undefined>;
  participantAccount: ComputedRef<IAccount['participant_account'] | undefined>;
  providerAccount: ComputedRef<IAccount['provider_account'] | undefined>;
}

export const useSessionStore = defineStore('session', (): ISessionStore => {
  const globalStore = useGlobalStore();
  const isAuth = ref(false);
  const loadComplete = ref(false);
  const currentUserAccount = ref<IAccount | undefined>();

  const session = ref();

  const setCurrentUserAccount = (account: IAccount | undefined) => {
    console.log('👤 [SessionStore] Setting current user account:', {
      hasAccount: !!account,
      providerRole: account?.provider_account?.role,
      isChairman: account?.provider_account?.role === 'chairman',
      isMember: account?.provider_account?.role === 'member'
    });
    currentUserAccount.value = account;
  };

  const clearAccount = () => {
    setCurrentUserAccount(undefined);
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

  const isChairman = computed(() => {
    const chairman = currentUserAccount.value?.provider_account?.role === 'chairman';
    console.log('👤 [SessionStore] isChairman computed:', chairman, 'role:', currentUserAccount.value?.provider_account?.role);
    return chairman;
  });

  const isMember = computed(() => {
    const member = currentUserAccount.value?.provider_account?.role === 'member';
    console.log('👤 [SessionStore] isMember computed:', member, 'role:', currentUserAccount.value?.provider_account?.role);
    return member;
  });

  // Удобные геттеры для различных типов данных
  const userAccount = computed(() => currentUserAccount.value?.user_account);
  const privateAccount = computed(() => currentUserAccount.value?.private_account);
  const blockchainAccount = computed(
    () => currentUserAccount.value?.blockchain_account,
  );
  const participantAccount = computed(
    () => currentUserAccount.value?.participant_account,
  );
  const providerAccount = computed(
    () => currentUserAccount.value?.provider_account,
  );

  const username = computed(() => globalStore.username);

  // Display name пользователя (ФИО или название организации)
  const displayName = computed(() => {
    const userProfile = privateAccount.value?.individual_data ||
                       privateAccount.value?.organization_data ||
                       privateAccount.value?.entrepreneur_data ||
                       null;

    const { displayName: computedDisplayName } = useDisplayName(userProfile);
    return computedDisplayName.value;
  });

  return {
    isAuth,
    init,
    session,
    username,
    displayName,
    close,
    loadComplete,
    currentUserAccount,
    setCurrentUserAccount,
    clearAccount,
    isRegistrationComplete,
    isChairman,
    isMember,
    // Удобные геттеры для различных типов данных
    userAccount,
    privateAccount,
    blockchainAccount,
    participantAccount,
    providerAccount,
  };
});
