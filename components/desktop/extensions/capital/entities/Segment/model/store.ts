import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ISegmentsPagination, IGetSegmentsInput } from './types';

const namespace = 'segmentStore';

interface ISegmentStore {
  // Реактивные состояния
  segments: Ref<ISegmentsPagination | null>;

  // Методы загрузки данных (только запросы!)
  loadSegments: (data: IGetSegmentsInput) => Promise<ISegmentsPagination>;
}

export const useSegmentStore = defineStore(namespace, (): ISegmentStore => {
  // Реактивные ref'ы
  const segments = ref<ISegmentsPagination | null>(null);

  // Методы загрузки (только чтение!)
  const loadSegments = async (data: IGetSegmentsInput): Promise<ISegmentsPagination> => {
    const loadedData = await api.loadSegments(data);
    segments.value = loadedData;
    return loadedData;
  };

  return {
    segments,
    loadSegments,
  };
});
