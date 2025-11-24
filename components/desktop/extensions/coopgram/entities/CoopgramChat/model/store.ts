import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ICoopgramAccountStatus } from './types';

const namespace = 'coopgramChatStore';

interface ICoopgramChatStore {
  accountStatus: Ref<ICoopgramAccountStatus | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  loadAccountStatus: () => Promise<ICoopgramAccountStatus | null>;
  clearAccountStatus: () => void;
  clearError: () => void;
}

export const useCoopgramChatStore = defineStore(
  namespace,
  (): ICoopgramChatStore => {
    const accountStatus = ref<ICoopgramAccountStatus | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const loadAccountStatus = async (): Promise<ICoopgramAccountStatus | null> => {
      isLoading.value = true;
      error.value = null;

      try {
        const status = await api.getAccountStatus();
        accountStatus.value = status;
        return status;
      } catch (err) {
        console.error('Failed to load Coopgram account status:', err);
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
