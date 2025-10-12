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
    console.log('loadedSegment on update', loadedSegment);
    // Обновляем сегмент в списке, если он там есть
    if (segments.value?.items) {
      const existingIndex = segments.value.items.findIndex(
        (segment) => segment.username === loadedSegment.username,
      );
      console.log('existingIndex', existingIndex);
      if (existingIndex !== -1) {
        console.log('replacing segment');
        // Заменяем существующий сегмент
        segments.value.items[existingIndex] = loadedSegment as any;
      } else {
        console.log('adding new segment');
        // Добавляем новый сегмент в список
        segments.value.items.push(loadedSegment as any);
        segments.value.totalCount += 1;
      }
    }

    return loadedSegment;
  };

  return {
    segments,
    loadSegments,
    loadAndUpdateSegment,
  };
});
