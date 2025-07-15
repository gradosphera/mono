import { computed } from 'vue';
import { useSessionStore } from '../model/store';

/**
 * Композабл для работы с данными текущего пользователя
 * Заменяет устаревший useCurrentUserStore
 */
export function useCurrentUser() {
  const session = useSessionStore();

  return {
    // Основные данные
    username: session.username,
    currentUserAccount: session.currentUserAccount,

    // Удобные геттеры для различных типов данных
    userAccount: computed(() => session.currentUserAccount?.user_account),
    privateAccount: computed(() => session.currentUserAccount?.private_account),
    blockchainAccount: computed(
      () => session.currentUserAccount?.blockchain_account,
    ),
    participantAccount: computed(
      () => session.currentUserAccount?.participant_account,
    ),
    providerAccount: computed(
      () => session.currentUserAccount?.provider_account,
    ),

    // Computed свойства для проверки статуса
    isRegistrationComplete: computed(() => session.isRegistrationComplete),
    isChairman: session.isChairman,
    isMember: session.isMember,
    isAuth: session.isAuth,

    // Методы
    setCurrentUserAccount: session.setCurrentUserAccount,
    clearAccount: () => session.setCurrentUserAccount(undefined),
  };
}
