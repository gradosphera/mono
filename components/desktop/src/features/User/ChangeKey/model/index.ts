import { ref } from 'vue';
import { api, type IChangeKeyInput } from '../api';

export function useChangeKey(): {
  loading: ReturnType<typeof ref<boolean>>;
  changeKey: (data: IChangeKeyInput) => Promise<boolean>;
  generateWif: () => string;
} {
  const loading = ref(false);

  async function changeKey(data: IChangeKeyInput): Promise<boolean> {
    loading.value = true;
    try {
      return await api.changeKey(data);
    } finally {
      loading.value = false;
    }
  }

  function generateWif(): string {
    return api.deriveNewWif();
  }

  return { loading, changeKey, generateWif };
}
