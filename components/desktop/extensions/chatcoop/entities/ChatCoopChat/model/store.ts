import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IChatCoopAccountStatus } from './types';

const namespace = 'chatcoopChatStore';

interface IChatCoopChatStore {
  accountStatus: Ref<IChatCoopAccountStatus | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  loadAccountStatus: () => Promise<IChatCoopAccountStatus | null>;
  clearAccountStatus: () => void;
  clearError: () => void;
}

export const useChatCoopChatStore = defineStore(
  namespace,
  (): IChatCoopChatStore => {
    const accountStatus = ref<IChatCoopAccountStatus | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const loadAccountStatus = async (): Promise<IChatCoopAccountStatus | null> => {
      isLoading.value = true;
      error.value = null;

      try {
        const status = await api.getAccountStatus();
        accountStatus.value = status;
        return status;
      } catch (err) {
        console.error('Failed to load ChatCoop account status:', err);
        error.value = 'Не удалось получить статус аккаунта. Попробуйте обновить страницу.';
        return null;
      } finally {
        isLoading.value = false;
      }
    };

    const clearAccountStatus = () => {
      accountStatus.value = null;
    };

    const clearError = () => {
      error.value = null;
    };

    return {
      accountStatus,
      isLoading,
      error,
      loadAccountStatus,
      clearAccountStatus,
      clearError,
    };
  },
);
