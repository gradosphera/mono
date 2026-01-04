import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ISegmentsPagination, IGetSegmentsInput, ISegment } from './types';

const namespace = 'segmentStore';

interface ISegmentStore {
  // Реактивные состояния - сегменты по project_hash
  segmentsByProject: Ref<Record<string, ISegmentsPagination | null>>;

  // Методы загрузки данных (только запросы!)
  loadSegments: (data: IGetSegmentsInput) => Promise<ISegmentsPagination>;
  addSegmentToList: (projectHash: string, segmentData: ISegment) => void;
  getSegmentsByProject: (projectHash: string) => ISegmentsPagination | null;
}

export const useSegmentStore = defineStore(namespace, (): ISegmentStore => {
  // Реактивные ref'ы - сегменты по project_hash
  const segmentsByProject = ref<Record<string, ISegmentsPagination | null>>({});

  // Методы загрузки (только чтение!)
  const loadSegments = async (data: IGetSegmentsInput): Promise<ISegmentsPagination> => {
    const loadedData = await api.loadSegments(data);
    // Сохраняем сегменты по project_hash
    const projectHash = data.filter?.project_hash;
    if (projectHash) {
      segmentsByProject.value[projectHash] = loadedData;
    }
    return loadedData;
  };

  // Получить сегменты по project_hash
  const getSegmentsByProject = (projectHash: string): ISegmentsPagination | null => {
    return segmentsByProject.value[projectHash] || null;
  };


  // Добавляет или обновляет сегмент в списке без загрузки с сервера
  const addSegmentToList = (projectHash: string, segmentData: ISegment) => {
    const projectSegments = segmentsByProject.value[projectHash];
    if (!projectSegments?.items) return;

    // Ищем существующий сегмент по username
    const existingIndex = projectSegments.items.findIndex(
      (segment) => segment.username === segmentData.username,
    );

    if (existingIndex !== -1) {
      // Заменяем существующий сегмент
      projectSegments.items[existingIndex] = segmentData as any;
    } else {
      // Добавляем новый сегмент в список
      projectSegments.items.push(segmentData as any);
      projectSegments.totalCount += 1;
    }
  };

  return {
    segmentsByProject,
    loadSegments,
    addSegmentToList,
    getSegmentsByProject,
  };
});
