import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useDebtStore,
  type ICreateDebtOutput,
} from 'app/extensions/capital/entities/Debt/model';

export type ICreateDebtInput = Mutations.Capital.CreateDebt.IInput['data'];

export function useCreateDebt() {
  const store = useDebtStore();

  const initialCreateDebtInput: ICreateDebtInput = {
    coopname: '',
    username: '',
    amount: '',
    debt_hash: '',
    project_hash: '',
    repaid_at: '',
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

  const createDebtInput = ref<ICreateDebtInput>({
    ...initialCreateDebtInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ICreateDebtInput>, initial: ICreateDebtInput) {
    Object.assign(input.value, initial);
  }

  async function createDebt(
    data: ICreateDebtInput,
  ): Promise<ICreateDebtOutput> {
    const transaction = await api.createDebt(data);

    // Обновляем список долгов после создания
    await store.loadDebts({});

    // Сбрасываем createDebtInput после выполнения createDebt
    resetInput(createDebtInput, initialCreateDebtInput);

    return transaction;
  }

  return { createDebt, createDebtInput };
}
