import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useInvestStore,
  type ICreateProjectInvestOutput,
} from 'app/extensions/capital/entities/Invest/model';

export type ICreateProjectInvestInput =
  Mutations.Capital.CreateProjectInvest.IInput['data'];

export function useCreateProjectInvest() {
  const store = useInvestStore();

  const initialCreateProjectInvestInput: ICreateProjectInvestInput = {
    coopname: '',
    username: '',
    project_hash: '',
    amount: '',
    invest_hash: '',
    statement: {
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
  };

  const createProjectInvestInput = ref<ICreateProjectInvestInput>({
    ...initialCreateProjectInvestInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateProjectInvestInput>,
    initial: ICreateProjectInvestInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createProjectInvest(
    data: ICreateProjectInvestInput,
  ): Promise<ICreateProjectInvestOutput> {
    const transaction = await api.createProjectInvest(data);

    // Обновляем список инвестиций после создания
    await store.loadInvests({});

    // Сбрасываем createProjectInvestInput после выполнения createProjectInvest
    resetInput(createProjectInvestInput, initialCreateProjectInvestInput);

    return transaction;
  }

  return { createProjectInvest, createProjectInvestInput };
}
