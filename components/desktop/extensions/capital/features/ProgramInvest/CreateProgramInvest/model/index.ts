import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useProgramInvestStore,
  type ICreateProgramInvestOutput,
} from 'app/extensions/capital/entities/ProgramInvest/model';

export type ICreateProgramInvestInput =
  Mutations.Capital.CreateProgramProperty.IInput['data'];

export function useCreateProgramInvest() {
  const store = useProgramInvestStore();

  const initialCreateProgramInvestInput: ICreateProgramInvestInput = {
    coopname: '',
    property_amount: '',
    property_description: '',
    property_hash: '',
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
    username: '',
  };

  const createProgramInvestInput = ref<ICreateProgramInvestInput>({
    ...initialCreateProgramInvestInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateProgramInvestInput>,
    initial: ICreateProgramInvestInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createProgramInvest(
    data: ICreateProgramInvestInput,
  ): Promise<ICreateProgramInvestOutput> {
    const transaction = await api.createProgramInvest(data);

    // Обновляем список программных инвестиций после создания
    await store.loadProgramInvests({});

    // Сбрасываем createProgramInvestInput после выполнения createProgramInvest
    resetInput(createProgramInvestInput, initialCreateProgramInvestInput);

    return transaction;
  }

  return { createProgramInvest, createProgramInvestInput };
}
