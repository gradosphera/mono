import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';

export type ICalculateVotesInput =
  Mutations.Capital.CalculateVotes.IInput['data'];

export function useCalculateVotes() {
  const segmentStore = useSegmentStore();

  async function calculateVotes(input: ICalculateVotesInput) {
    const transaction = await api.calculateVotes(input);

    // Обновляем сегмент после успешного расчета голосов
    await segmentStore.loadAndUpdateSegment({
      filter: {
        coopname: input.coopname,
        project_hash: input.project_hash,
        username: input.username,
      },
    });

    return transaction;
  }

  return { calculateVotes };
}
