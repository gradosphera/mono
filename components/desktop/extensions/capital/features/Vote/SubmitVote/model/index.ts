import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import type { ISubmitVoteOutput } from 'app/extensions/capital/entities/Vote/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';

export type ISubmitVoteInput = Mutations.Capital.SubmitVote.IInput['data'];

export function useSubmitVote() {
  const projectStore = useProjectStore();
  const segmentStore = useSegmentStore();

  const initialSubmitVoteInput: ISubmitVoteInput = {
    coopname: '',
    project_hash: '',
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

    // Сбрасываем submitVoteInput после выполнения submitVote
    resetInput(submitVoteInput, initialSubmitVoteInput);

    return transaction;
  }

  async function submitVoteAndUpdateStores(
    data: ISubmitVoteInput,
  ): Promise<ISubmitVoteOutput> {
    const transaction = await submitVote(data);

    // Обновляем проект в сторе проекта
    await projectStore.loadProject({ hash: data.project_hash });

    // Перезагружаем сегменты для этого проекта
    await segmentStore.loadSegments({
      filter: {
        coopname: data.coopname,
        project_hash: data.project_hash,
      },
      options: {
        page: 1,
        limit: 100,
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    });

    return transaction;
  }

  return { submitVote, submitVoteAndUpdateStores, submitVoteInput };
}
