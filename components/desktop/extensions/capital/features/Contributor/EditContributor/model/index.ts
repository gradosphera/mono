import { ref } from 'vue';
import { api, type IEditContributorInput, type IEditContributorOutput } from '../api';
import { useSessionStore } from 'src/entities/Session/model';
import { useSystemStore } from 'src/entities/System/model';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';

export type { IEditContributorInput, IEditContributorOutput };

export function useEditContributor() {
  const isLoading = ref(false);
  const { username } = useSessionStore();
  const { info } = useSystemStore();
  const contributorStore = useContributorStore();

  const editContributor = async (
    input: Omit<IEditContributorInput, 'username' | 'coopname'>,
  ): Promise<IEditContributorOutput> => {
    isLoading.value = true;
    try {
      const data: IEditContributorInput = {
        ...input,
        username,
        coopname: info.coopname,
      };

      const result = await api.editContributor(data);

      // Обновляем данные в store после успешного редактирования
      contributorStore.updateSelf(result);

      return result;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    editContributor,
    isLoading,
  };
}
