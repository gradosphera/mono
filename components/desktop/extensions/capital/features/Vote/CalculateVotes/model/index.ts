import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type ICalculateVotesInput =
  Mutations.Capital.CalculateVotes.IInput['data'];

export function useCalculateVotes() {
  const segmentStore = useSegmentStore();
  const projectStore = useProjectStore();

  async function calculateVotes(input: ICalculateVotesInput) {
    const segment = await api.calculateVotes(input);

    // Обновляем сегмент в списке после успешного расчета голосов
    segmentStore.addSegmentToList(input.project_hash, segment);

    // Обновляем проект в сторе проекта
    await projectStore.loadProject({ hash: input.project_hash });

    return segment;
  }

  return { calculateVotes };
}
