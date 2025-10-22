<template lang="pug">
div
  WindowLoader(v-show='isInitialLoading', text='Загрузка данных результатов...')
  q-card(v-show='!isInitialLoading', flat)
    div
      // Виджет списка проектов для результатов
      ListResultProjectsWidget(
        :coopname='info.coopname',
        :expanded='expandedProjects',
        @toggle-expand='handleProjectToggleExpand',
        @project-click='handleProjectClick',
        @data-loaded='handleProjectsDataLoaded'
      )
        template(#project-content='{ project }')
          // Виджет сегментов пользователя для результатов
          ResultSubmissionSegmentsWidget(
            :project-hash='project.project_hash',
            :coopname='info.coopname',
            :expanded='expandedSegments',
            :project='project',
            :segments-to-reload='segmentsToReload',
            @toggle-expand='handleSegmentToggleExpand',
            @segment-click='handleSegmentClick',
            @data-loaded='handleSegmentsDataLoaded',
            @results-changed='handleResultsChanged'
          )
            template(#actions='{ segment }')
              ResultSubmissionActionsWidget(:segment='segment')
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { WindowLoader } from 'src/shared/ui/Loader';
import { ListResultProjectsWidget, ResultSubmissionSegmentsWidget, ResultSubmissionActionsWidget } from 'app/extensions/capital/widgets';

const { info } = useSystemStore();

// Ключи для сохранения состояния в LocalStorage
const PROJECTS_EXPANDED_KEY = 'capital_results_projects_expanded';
const SEGMENTS_EXPANDED_KEY = 'capital_results_segments_expanded';

// Состояние первичной загрузки (WindowLoader)
const isInitialLoading = ref(true);

// Состояние для отслеживания сегментов, которые нужно обновить
const segmentsToReload = ref<Record<string, number>>({});

// Управление развернутостью проектов
const {
  expanded: expandedProjects,
  loadExpandedState: loadProjectsExpandedState,
  cleanupExpandedByKeys: cleanupProjectsExpanded,
  toggleExpanded: toggleProjectExpanded,
} = useExpandableState(PROJECTS_EXPANDED_KEY);

// Управление развернутостью сегментов (участников)
const {
  expanded: expandedSegments,
  loadExpandedState: loadSegmentsExpandedState,
  cleanupExpandedByKeys: cleanupSegmentsExpanded,
  toggleExpanded: toggleSegmentExpanded,
} = useExpandableState(SEGMENTS_EXPANDED_KEY);

const handleProjectClick = (projectHash: string) => {
  // Клик на строку проекта приводит к развороту/свертыванию
  toggleProjectExpanded(projectHash);
};

const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleSegmentToggleExpand = (username: string) => {
  toggleSegmentExpanded(username);
};

const handleProjectsDataLoaded = (projectHashes: string[]) => {
  // Очищаем устаревшие записи expanded проектов после загрузки данных
  cleanupProjectsExpanded(projectHashes);

  // Отключаем WindowLoader после завершения первичной загрузки
  isInitialLoading.value = false;
};

const handleSegmentsDataLoaded = (usernames: string[]) => {
  // Очищаем устаревшие записи expanded сегментов после загрузки данных
  cleanupSegmentsExpanded(usernames);
};

const handleSegmentClick = (username: string) => {
  // Клик на строку сегмента приводит к развороту/свертыванию
  toggleSegmentExpanded(username);
};

const handleResultsChanged = (data: { projectHash: string; username: string }) => {
  // Помечаем сегмент для перезагрузки (используем timestamp как уникальный ключ)
  segmentsToReload.value[data.username] = Date.now();
};

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadSegmentsExpandedState();
});
</script>
