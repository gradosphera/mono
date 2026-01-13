<template lang="pug">
div
  WindowLoader(v-show='isInitialLoading', text='Загрузка данных результатов...')
  q-card(v-show='!isInitialLoading', flat)
    div
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
import { onMounted, ref } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { WindowLoader } from 'src/shared/ui/Loader';
import { ResultSubmissionSegmentsWidget, ResultSubmissionActionsWidget } from 'app/extensions/capital/widgets';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';

const { info } = useSystemStore();
const segmentStore = useSegmentStore();

// Используем composable для загрузки проекта
const { project, projectHash } = useProjectLoader();

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
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadSegmentsExpandedState();
});
</script>
