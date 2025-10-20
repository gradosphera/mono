import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ISegmentsPagination, IGetSegmentsInput, ISegment, IGetSegmentInput } from './types';

const namespace = 'segmentStore';

interface ISegmentStore {
  // Реактивные состояния
  segments: Ref<ISegmentsPagination | null>;

  // Методы загрузки данных (только запросы!)
  loadSegments: (data: IGetSegmentsInput) => Promise<ISegmentsPagination>;
  loadAndUpdateSegment: (data: IGetSegmentInput) => Promise<ISegment>;
  addSegmentToList: (segmentData: ISegment) => void;
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

  // Загружает один сегмент и обновляет его в списке segments
  const loadAndUpdateSegment = async (data: IGetSegmentInput): Promise<ISegment> => {
    const loadedSegment = await api.loadSegment(data);

    // Обновляем сегмент в списке через addSegmentToList
    addSegmentToList(loadedSegment);

    return loadedSegment;
  };

  // Добавляет или обновляет сегмент в списке без загрузки с сервера
  const addSegmentToList = (segmentData: ISegment) => {
    // Ищем существующий сегмент по username
    const existingIndex = segments.value?.items.findIndex(
      (segment) => segment.username === segmentData.username,
    );

    if (existingIndex !== undefined && existingIndex !== -1 && segments.value?.items) {
      // Заменяем существующий сегмент
      segments.value.items[existingIndex] = segmentData as any;
    } else if (segments.value?.items) {
      // Добавляем новый сегмент в список
      segments.value.items.push(segmentData as any);
      segments.value.totalCount += 1;
    }
  };

  return {
    segments,
    loadSegments,
    loadAndUpdateSegment,
    addSegmentToList,
  };
});
