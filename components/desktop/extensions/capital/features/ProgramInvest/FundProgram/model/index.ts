import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IFundProgramInput = Mutations.Capital.FundProgram.IInput['data'];

export function useFundProgram() {
  const initialFundProgramInput: IFundProgramInput = {
    amount: '',
    coopname: '',
    memo: '',
  };

  const fundProgramInput = ref<IFundProgramInput>({
    ...initialFundProgramInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IFundProgramInput>,
    initial: IFundProgramInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function fundProgram(data: IFundProgramInput) {
    const transaction = await api.fundProgram(data);

    // Сбрасываем fundProgramInput после выполнения fundProgram
    resetInput(fundProgramInput, initialFundProgramInput);

    return transaction;
  }

  return { fundProgram, fundProgramInput };
}
