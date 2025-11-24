import { ref } from 'vue';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export function useCreateMatrixAccount() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const createAccount = async (username: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { [Mutations.Coopgram.CreateAccount.name]: result } = await client.Mutation(
        Mutations.Coopgram.CreateAccount.mutation,
        {
          variables: {
          data: { username, password },
          },
        }
      );

      return result;
    } catch (err: any) {
      console.error('Failed to create Matrix account:', err);
      error.value = err?.message || 'Не удалось создать аккаунт Matrix';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    createAccount,
    isLoading,
    error,
  };
}
