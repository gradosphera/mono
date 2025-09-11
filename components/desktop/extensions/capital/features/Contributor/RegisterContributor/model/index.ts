import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useContributorStore,
  type IRegisterContributorOutput,
} from 'app/extensions/capital/entities/Contributor/model';

export type IRegisterContributorInput =
  Mutations.Capital.RegisterContributor.IInput['data'];

export function useRegisterContributor() {
  const store = useContributorStore();

  const initialRegisterContributorInput: IRegisterContributorInput = {
    coopname: '',
    username: '',
    contract: {
      doc_hash: '',
      hash: '',
      meta: {
        block_num: 0,
        coopname: '',
        created_at: '',
        generator: '',
        lang: '',
        links: [],
        registry_id: 0,
        timezone: '',
        title: '',
        username: '',
        version: '',
      },
      meta_hash: '',
      signatures: [],
      version: '',
    },
    contributor_hash: '',
    is_external_contract: false,
    rate_per_hour: '',
  };

  const registerContributorInput = ref<IRegisterContributorInput>({
    ...initialRegisterContributorInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IRegisterContributorInput>,
    initial: IRegisterContributorInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function registerContributor(
    data: IRegisterContributorInput,
  ): Promise<IRegisterContributorOutput> {
    const transaction = await api.registerContributor(data);

    // Обновляем список вкладчиков после регистрации
    await store.loadContributors({});

    // Сбрасываем registerContributorInput после выполнения registerContributor
    resetInput(registerContributorInput, initialRegisterContributorInput);

    return transaction;
  }

  return { registerContributor, registerContributorInput };
}
