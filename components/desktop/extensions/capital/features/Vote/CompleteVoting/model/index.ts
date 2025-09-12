import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type ICompleteVotingInput =
  Mutations.Capital.CompleteVoting.IInput['data'];

export function useCompleteVoting() {
  const initialCompleteVotingInput: ICompleteVotingInput = {
    coopname: '',
    project_hash: '',
  };

  const completeVotingInput = ref<ICompleteVotingInput>({
    ...initialCompleteVotingInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICompleteVotingInput>,
    initial: ICompleteVotingInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function completeVoting(data: ICompleteVotingInput) {
    const transaction = await api.completeVoting(data);

    // Сбрасываем completeVotingInput после выполнения completeVoting
    resetInput(completeVotingInput, initialCompleteVotingInput);

    return transaction;
  }

  return { completeVoting, completeVotingInput };
}
