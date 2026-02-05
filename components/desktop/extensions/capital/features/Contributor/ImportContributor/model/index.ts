import { ref, type Ref } from 'vue';
import { api } from '../api';
import {
  useContributorStore,
  type IImportContributorOutput,
  type IImportContributorInput,
} from 'app/extensions/capital/entities/Contributor/model';

// Экспортируем тип из сущности для удобства
export type { IImportContributorInput };

export function useImportContributor() {
  const store = useContributorStore();

  const initialImportContributorInput: IImportContributorInput = {
    coopname: '',
    username: '',
    contribution_amount: '',
    contributor_contract_number: '',
    contributor_contract_created_at: '',
    memo: undefined,
  };

  const importContributorInput = ref<IImportContributorInput>({
    ...initialImportContributorInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IImportContributorInput>,
    initial: IImportContributorInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function importContributor(
    data: IImportContributorInput,
  ): Promise<IImportContributorOutput> {
    const transaction = await api.importContributor(data);

    // Обновляем список участников после импорта
    await store.loadContributors({});

    // Сбрасываем importContributorInput после выполнения importContributor
    resetInput(importContributorInput, initialImportContributorInput);

    return transaction;
  }

  return { importContributor, importContributorInput };
}
