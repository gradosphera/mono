import { defineStore } from 'pinia';
import { api } from '../api';
import type { ITimeEntriesPagination, IGetTimeEntriesInput } from './types';

const namespace = 'timeEntriesStore';

interface ITimeEntriesStore {
  loadTimeEntries: (data: IGetTimeEntriesInput) => Promise<ITimeEntriesPagination>;
}

export const useTimeEntriesStore = defineStore(namespace, (): ITimeEntriesStore => {
  const loadTimeEntries = async (data: IGetTimeEntriesInput): Promise<ITimeEntriesPagination> => {
    const loadedData = await api.loadTimeEntries(data);
    return loadedData;
  };

  return {
    loadTimeEntries,
  };
});
