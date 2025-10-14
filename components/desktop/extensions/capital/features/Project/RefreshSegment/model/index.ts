import { computed } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
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
  const needsUpdate = computed(() => segmentNeedsUpdate(segment, project.value));

  async function refreshSegment(data: IRefreshSegmentInput) {
    const transaction = await api.refreshSegment(data);
    return transaction;
  }

  async function refreshSegmentAndUpdateStore(data: IRefreshSegmentInput) {
    const transaction = await refreshSegment(data);

    // Ждем 3 секунды для синхронизации данных
    setTimeout(async () => {
      try {
        await segmentStore.loadAndUpdateSegment({
          filter: {
            coopname: data.coopname,
            project_hash: data.project_hash,
            username: data.username,
          },
        });
      } catch (error) {
        console.warn('Не удалось обновить сегмент после пересчета:', error);
      }
    }, 1000);

    return transaction;
  }

  return { refreshSegment, refreshSegmentAndUpdateStore, refreshSegmentInput, needsUpdate, project };
}

// Экспортируемая функция для проверки необходимости обновления сегмента
export function segmentNeedsUpdate(segment: ISegment, project?: IProject): boolean {
  if (!project) return false;
  // Проверяем актуальность CRPS для каждой роли
  const authorUpdated = (!segment.is_author) ||
                       (segment.last_author_base_reward_per_share === project.crps.author_base_cumulative_reward_per_share &&
                        segment.last_author_bonus_reward_per_share === project.crps.author_bonus_cumulative_reward_per_share);

  // Координаторы используют пропорциональное распределение на основе coordinators_investment_pool
  const coordinatorUpdated = (!segment.is_coordinator) ||
                            (segment.last_known_coordinators_investment_pool === project.fact.coordinators_investment_pool);

  const contributorUpdated = (!segment.is_contributor) ||
                            (segment.last_contributor_reward_per_share === project.crps.contributor_cumulative_reward_per_share);

  // Проверяем актуальность инвестиционного пула для расчета provisional_amount (нужно всем ролям)
  const investPoolUpdated = (segment.last_known_invest_pool === project.fact.invest_pool);

  // Проверяем актуальность базового пула создателей для корректного расчета использования инвестиций (нужно только инвесторам)
  const creatorsBasePoolUpdated = (!segment.is_investor) ||
                                   (segment.last_known_creators_base_pool === project.fact.creators_base_pool);

  return !(authorUpdated && coordinatorUpdated && contributorUpdated && investPoolUpdated && creatorsBasePoolUpdated);
}
