import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useVoteStore,
  type ISubmitVoteOutput,
} from 'app/extensions/capital/entities/Vote/model';

export type ISubmitVoteInput = Mutations.Capital.SubmitVote.IInput['data'];

export function useSubmitVote() {
  const store = useVoteStore();

  const initialSubmitVoteInput: ISubmitVoteInput = {
    coopname: '',
    project_hash: '',
    voter: '',
    votes: [],
  };

  const submitVoteInput = ref<ISubmitVoteInput>({
    ...initialSubmitVoteInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ISubmitVoteInput>, initial: ISubmitVoteInput) {
    Object.assign(input.value, initial);
  }

  async function submitVote(
    data: ISubmitVoteInput,
  ): Promise<ISubmitVoteOutput> {
    const transaction = await api.submitVote(data);

    // Обновляем список голосов после голосования
    await store.loadVotes({});

    // Сбрасываем submitVoteInput после выполнения submitVote
    resetInput(submitVoteInput, initialSubmitVoteInput);

    return transaction;
  }

  return { submitVote, submitVoteInput };
}
