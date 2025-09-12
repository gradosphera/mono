import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type ICalculateVotesInput =
  Mutations.Capital.CalculateVotes.IInput['data'];

export function useCalculateVotes() {
  const initialCalculateVotesInput: ICalculateVotesInput = {
    coopname: '',
    project_hash: '',
    username: '',
  };

  const calculateVotesInput = ref<ICalculateVotesInput>({
    ...initialCalculateVotesInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICalculateVotesInput>,
    initial: ICalculateVotesInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function calculateVotes(data: ICalculateVotesInput) {
    const transaction = await api.calculateVotes(data);

    // Сбрасываем calculateVotesInput после выполнения calculateVotes
    resetInput(calculateVotesInput, initialCalculateVotesInput);

    return transaction;
  }

  return { calculateVotes, calculateVotesInput };
}
