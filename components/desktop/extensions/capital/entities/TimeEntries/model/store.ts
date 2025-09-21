import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ITimeEntriesPagination, IGetTimeEntriesInput } from './types';

const namespace = 'timeEntriesStore';

interface ITimeEntriesStore {
  timeEntries: Ref<ITimeEntriesPagination | null>;
  loadTimeEntries: (data: IGetTimeEntriesInput) => Promise<void>;
}

export const useTimeEntriesStore = defineStore(namespace, (): ITimeEntriesStore => {
  const timeEntries = ref<ITimeEntriesPagination | null>(null);

  const loadTimeEntries = async (data: IGetTimeEntriesInput): Promise<void> => {
    const loadedData = await api.loadTimeEntries(data);
    timeEntries.value = loadedData;
  };

  return {
    timeEntries,
    loadTimeEntries,
  };
});
