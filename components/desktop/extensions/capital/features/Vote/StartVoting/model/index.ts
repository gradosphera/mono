import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IStartVotingInput = Mutations.Capital.StartVoting.IInput['data'];

export function useStartVoting() {
  const initialStartVotingInput: IStartVotingInput = {
    coopname: '',
    project_hash: '',
  };

  const startVotingInput = ref<IStartVotingInput>({
    ...initialStartVotingInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IStartVotingInput>,
    initial: IStartVotingInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function startVoting(data: IStartVotingInput) {
    const transaction = await api.startVoting(data);

    // Сбрасываем startVotingInput после выполнения startVoting
    resetInput(startVotingInput, initialStartVotingInput);

    return transaction;
  }

  return { startVoting, startVotingInput };
}
