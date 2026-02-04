<template lang="pug">
div
  WindowLoader(v-show='isInitialLoading', text='Загрузка данных результатов...')
  q-card(v-show='!isInitialLoading', flat)
    // Заглушка для проектов, которые не готовы к приему результатов
    div(v-show='!canShowResults')
      .text-center.q-pa-xl
        q-icon(name='hourglass_empty', size='4rem', color='grey-5')
        .q-mt-md
          .text-h6.text-grey-7 Проект еще не готов к приему результатов
          .text-body2.text-grey-6.q-mt-sm
            | Результаты можно будет отправить после завершения голосования и расчета результатов.
            br
            | Следите за статусом проекта.

    // Контент для проектов в статусе FINALIZED или RESULT
    div(v-show='canShowResults')
      // Виджет сегментов пользователя для результатов
      ResultSubmissionSegmentsWidget(
        :project-hash='projectHash'
        :coopname='info.coopname'
        :expanded='expandedSegments'
        :project='project || undefined'
        @toggle-expand='handleSegmentToggleExpand'
        @segment-click='handleSegmentClick'
        @data-loaded='handleSegmentsDataLoaded'
      )
        template(#actions='{ segment }')
          ResultSubmissionActionsWidget(
            :segment='segment'
            @segment-updated='handleSegmentUpdated'
          )
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { WindowLoader } from 'src/shared/ui/Loader';
import { ResultSubmissionSegmentsWidget, ResultSubmissionActionsWidget } from 'app/extensions/capital/widgets';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import { Zeus } from '@coopenomics/sdk';

const { info } = useSystemStore();
const segmentStore = useSegmentStore();

// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();

// Ключ для сохранения состояния в LocalStorage
const SEGMENTS_EXPANDED_KEY = 'capital_component_results_segments_expanded';

// Состояние первичной загрузки (WindowLoader)
const isInitialLoading = ref(true);

// Управление развернутостью сегментов (участников)
const {
  expanded: expandedSegments,
  loadExpandedState: loadSegmentsExpandedState,
  cleanupExpandedByKeys: cleanupSegmentsExpanded,
  toggleExpanded: toggleSegmentExpanded,
} = useExpandableState(SEGMENTS_EXPANDED_KEY);

// Проверка, можно ли показывать результаты (только для статусов FINALIZED и RESULT)
const canShowResults = computed(() => {
  if (!project.value) return false;
  const status = String(project.value.status);
  return status === Zeus.ProjectStatus.FINALIZED || status === Zeus.ProjectStatus.RESULT;
});


const handleSegmentToggleExpand = (username: string) => {
  toggleSegmentExpanded(username);
};

const handleSegmentsDataLoaded = (usernames: string[]) => {
  // Очищаем устаревшие записи expanded сегментов после загрузки данных
  cleanupSegmentsExpanded(usernames);

  // Отключаем WindowLoader после завершения первичной загрузки
  isInitialLoading.value = false;
};

const handleSegmentUpdated = async (segment: ISegment) => {
  // Перезагружаем сегменты компонента, к которому принадлежит обновленный сегмент
  try {
    await segmentStore.loadSegments({
      filter: {
        coopname: info.coopname,
        project_hash: segment.project_hash,
      },
      options: {
        page: 1,
        limit: 1000,
        sortOrder: 'ASC',
      },
    });
  } catch (error) {
    console.error('Ошибка при перезагрузке сегментов после обновления:', error);
  }
};

const handleSegmentClick = (username: string) => {
  // Клик на строку сегмента приводит к развороту/свертыванию
  toggleSegmentExpanded(username);
};

// Инициализация
onMounted(async () => {
  // Загружаем данные проекта (если еще не загружены)
  await loadProject();
  
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadSegmentsExpandedState();
});
</script>
