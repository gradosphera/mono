import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IFundProjectInput = Mutations.Capital.FundProject.IInput['data'];

export function useFundProject() {
  const initialFundProjectInput: IFundProjectInput = {
    amount: '',
    coopname: '',
    memo: '',
    project_hash: '',
  };

  const fundProjectInput = ref<IFundProjectInput>({
    ...initialFundProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IFundProjectInput>,
    initial: IFundProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function fundProject(data: IFundProjectInput) {
    const transaction = await api.fundProject(data);

    // Сбрасываем fundProjectInput после выполнения fundProject
    resetInput(fundProjectInput, initialFundProjectInput);

    return transaction;
  }

  return { fundProject, fundProjectInput };
}
