import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IRefreshProgramInput =
  Mutations.Capital.RefreshProgram.IInput['data'];

export function useRefreshProgram() {
  const initialRefreshProgramInput: IRefreshProgramInput = {
    coopname: '',
    username: '',
  };

  const refreshProgramInput = ref<IRefreshProgramInput>({
    ...initialRefreshProgramInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IRefreshProgramInput>,
    initial: IRefreshProgramInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function refreshProgram(data: IRefreshProgramInput) {
    const transaction = await api.refreshProgram(data);

    // Сбрасываем refreshProgramInput после выполнения refreshProgram
    resetInput(refreshProgramInput, initialRefreshProgramInput);

    return transaction;
  }

  return { refreshProgram, refreshProgramInput };
}
