import { computed } from 'vue';
import { Mutations, Zeus } from '@coopenomics/sdk';
import { api } from '../api';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type IRefreshSegmentInput =
  Mutations.Capital.RefreshSegment.IInput['data'];

export interface IRefreshSegmentProps {
  segment: ISegment;
  coopname: string;
}

export function useRefreshSegment(props: IRefreshSegmentProps) {
  const { segment, coopname } = props;
  const segmentStore = useSegmentStore();
  const projectStore = useProjectStore();

  // Создаем input на основе переданных пропсов
  const refreshSegmentInput = computed<IRefreshSegmentInput>(() => ({
    coopname,
    project_hash: segment.project_hash || '',
    username: segment.username || '',
  }));

  // Получаем проект из store
  const project = computed(() => {
    return projectStore.projects.items.find(p => p.project_hash === segment.project_hash);
  });

  // Логика проверки необходимости обновления сегмента (использует общую функцию)
  const needsUpdate = computed(() => segmentNeedsUpdate(segment));

  async function refreshSegment(data: IRefreshSegmentInput) {
    const transaction = await api.refreshSegment(data);
    return transaction;
  }

  async function refreshSegmentAndUpdateStore(data: IRefreshSegmentInput) {
    const updatedSegment = await refreshSegment(data);

    // Проверяем, что сегмент был возвращен
    if (updatedSegment) {
      // Устанавливаем обновленный сегмент в стор напрямую
      segmentStore.addSegmentToList(updatedSegment);
    }

    return updatedSegment;
  }

  return { refreshSegment, refreshSegmentAndUpdateStore, refreshSegmentInput, needsUpdate, project };
}

// Экспортируемая функция для проверки необходимости обновления сегмента
export function segmentNeedsUpdate(segment: ISegment): boolean {
  return segment.status === Zeus.SegmentStatus.GENERATION;
}
