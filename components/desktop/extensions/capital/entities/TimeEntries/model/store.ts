import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ITimeEntriesPagination, IGetTimeEntriesInput } from './types';

const namespace = 'timeEntriesStore';

interface ITimeEntriesStore {
  timeEntries: Ref<ITimeEntriesPagination | null>;
  loadTimeEntries: (data: IGetTimeEntriesInput) => Promise<ITimeEntriesPagination>;
}

export const useTimeEntriesStore = defineStore(namespace, (): ITimeEntriesStore => {
  const timeEntries = ref<ITimeEntriesPagination | null>(null);

  const loadTimeEntries = async (data: IGetTimeEntriesInput): Promise<ITimeEntriesPagination> => {
    const loadedData = await api.loadTimeEntries(data);
    timeEntries.value = loadedData;
    return loadedData;
  };

  return {
    timeEntries,
    loadTimeEntries,
  };
});
