import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IRefreshSegmentInput =
  Mutations.Capital.RefreshSegment.IInput['data'];

export function useRefreshSegment() {
  const initialRefreshSegmentInput: IRefreshSegmentInput = {
    coopname: '',
    project_hash: '',
    username: '',
  };

  const refreshSegmentInput = ref<IRefreshSegmentInput>({
    ...initialRefreshSegmentInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IRefreshSegmentInput>,
    initial: IRefreshSegmentInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function refreshSegment(data: IRefreshSegmentInput) {
    const transaction = await api.refreshSegment(data);

    // Сбрасываем refreshSegmentInput после выполнения refreshSegment
    resetInput(refreshSegmentInput, initialRefreshSegmentInput);

    return transaction;
  }

  return { refreshSegment, refreshSegmentInput };
}
