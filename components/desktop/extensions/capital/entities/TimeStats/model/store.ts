import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ITimeStatsPagination, IGetTimeStatsInput, ITimeStat } from './types';

const namespace = 'timeStatsStore';

interface ITimeStatsStore {
  timeStats: Ref<ITimeStatsPagination | null>;
  loadTimeStats: (data: IGetTimeStatsInput) => Promise<ITimeStatsPagination>;
  updateTimeStatInList: (timeStatData: ITimeStat) => void;
  loadTimeStat: (data: { username: string; project_hash: string; coopname?: string }) => Promise<ITimeStat | null>;
}

export const useTimeStatsStore = defineStore(namespace, (): ITimeStatsStore => {
  const timeStats = ref<ITimeStatsPagination | null>(null);

  const loadTimeStats = async (data: IGetTimeStatsInput): Promise<ITimeStatsPagination> => {
    const loadedData = await api.loadTimeStats(data);
    timeStats.value = loadedData;
    return loadedData;
  };

  const updateTimeStatInList = (timeStatData: ITimeStat) => {
    if (!timeStats.value) return;

    // Ищем существующую статистику по project_hash
    const existingIndex = timeStats.value.items.findIndex(
      (stat) => stat.project_hash === timeStatData.project_hash,
    );

    if (existingIndex !== -1) {
      // Заменяем существующую статистику
      timeStats.value.items[existingIndex] = timeStatData;
    } else {
      // Добавляем новую статистику в начало списка
      timeStats.value.items = [
        timeStatData,
        ...timeStats.value.items,
      ];
      // Увеличиваем общее количество
      timeStats.value.totalCount += 1;
    }
  };

  const loadTimeStat = async (data: { username: string; project_hash: string; coopname?: string }) => {
    // Используем существующий API метод с фильтрами для получения одной статистики
    const stats = await api.loadTimeStats({
      data: {
        username: data.username,
        project_hash: data.project_hash,
        coopname: data.coopname,
      },
      options: {
        page: 1,
        limit: 1,
        sortBy: 'project_name',
        sortOrder: 'ASC',
      },
    });

    // Если нашли статистику, обновляем её в списке
    if (stats.items && stats.items.length > 0) {
      updateTimeStatInList(stats.items[0]);
      return stats.items[0];
    }

    return null;
  };

  return {
    timeStats,
    loadTimeStats,
    updateTimeStatInList,
    loadTimeStat,
  };
});
