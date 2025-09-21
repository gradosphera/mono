import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ITimeStatsPagination, IGetTimeStatsInput } from './types';

const namespace = 'timeStatsStore';

interface ITimeStatsStore {
  timeStats: Ref<ITimeStatsPagination | null>;
  loadTimeStats: (data: IGetTimeStatsInput) => Promise<void>;
}

export const useTimeStatsStore = defineStore(namespace, (): ITimeStatsStore => {
  const timeStats = ref<ITimeStatsPagination | null>(null);

  const loadTimeStats = async (data: IGetTimeStatsInput): Promise<void> => {
    const loadedData = await api.loadTimeStats(data);
    timeStats.value = loadedData;
  };

  return {
    timeStats,
    loadTimeStats,
  };
});
