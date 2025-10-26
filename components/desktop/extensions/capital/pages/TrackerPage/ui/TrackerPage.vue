<template lang="pug">
div
  q-card(flat)
    div
      // Виджет статистики по проектам
      TimeStatsWidget(
        :coopname='info.coopname',
        :username='username',
        :expanded='expandedProjects',
        :force-reload='forceReload',
        @toggle-expand='handleProjectToggleExpand',
        @project-click='handleProjectClick',
        @data-loaded='handleProjectsDataLoaded'
        @pagination-changed='handlePaginationChanged'
      )
        template(#project-content='{ project }')
          TimeIssuesWidget(
            :project-hash='project.project_hash',
            :coopname='info.coopname',
            :username='username',
            :expanded='expandedIssues',
            :show-name='false',
            @toggle-expand='handleIssueToggleExpand',
            @issue-click='handleIssueClick',
            @data-loaded='handleIssuesDataLoaded'
          )
            template(#issue-content='{ issue }')
              TimeEntriesWidget(
                :issue-hash='issue.issue_hash',
                :coopname='info.coopname',
                :username='username'
              )
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session/model/store';
import { useExpandableState, useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
import 'src/shared/ui/TitleStyles';
import { TimeStatsWidget, TimeIssuesWidget, TimeEntriesWidget } from 'app/extensions/capital/widgets';
import { useTimeStatsStore } from 'app/extensions/capital/entities/TimeStats/model';

const { info } = useSystemStore();
const { username } = useSessionStore();
const timeStatsStore = useTimeStatsStore();

// Ключи для сохранения состояния в LocalStorage
const PROJECTS_EXPANDED_KEY = 'capital_tracker_projects_expanded';
const ISSUES_EXPANDED_KEY = 'capital_tracker_issues_expanded';

// Состояние для принудительной перезагрузки данных
const forceReload = ref(0);

// Текущее состояние пагинации для poll обновлений
const currentPage = ref(1);
const currentRowsPerPage = ref(100);
const currentSortBy = ref('project_name');
const currentSortOrder = ref('ASC');

// Управление развернутостью проектов
const {
  expanded: expandedProjects,
  loadExpandedState: loadProjectsExpandedState,
  cleanupExpandedByKeys: cleanupProjectsExpanded,
  toggleExpanded: toggleProjectExpanded,
} = useExpandableState(PROJECTS_EXPANDED_KEY);

// Управление развернутостью задач
const {
  expanded: expandedIssues,
  loadExpandedState: loadIssuesExpandedState,
  cleanupExpandedByKeys: cleanupIssuesExpanded,
  toggleExpanded: toggleIssueExpanded,
} = useExpandableState(ISSUES_EXPANDED_KEY);

const handleProjectClick = (projectHash: string) => {
  // Клик на строку проекта приводит к развороту/свертыванию
  toggleProjectExpanded(projectHash);
};

const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleIssueToggleExpand = (issueHash: string) => {
  toggleIssueExpanded(issueHash);
};

const handleProjectsDataLoaded = (projectHashes: string[]) => {
  // Очищаем устаревшие записи expanded проектов после загрузки данных
  cleanupProjectsExpanded(projectHashes);
};

const handleIssuesDataLoaded = (issueHashes: string[]) => {
  // Очищаем устаревшие записи expanded задач после загрузки данных
  cleanupIssuesExpanded(issueHashes);
};

const handleIssueClick = (issueHash: string) => {
  // Клик на строку задачи приводит к развороту/свертыванию
  toggleIssueExpanded(issueHash);
};

const handlePaginationChanged = (paginationData: { page: number; rowsPerPage: number; sortBy: string; sortOrder: string }) => {
  // Сохраняем текущую пагинацию для poll обновлений
  currentPage.value = paginationData.page;
  currentRowsPerPage.value = paginationData.rowsPerPage;
  currentSortBy.value = paginationData.sortBy;
  currentSortOrder.value = paginationData.sortOrder;
};

/**
 * Функция для перезагрузки данных трекера
 * Используется для poll обновлений
 */
const reloadTrackerData = async () => {
  try {
    // Используем store для загрузки данных статистики времени с текущими параметрами пагинации
    await timeStatsStore.loadTimeStats({
      data: {
        username,
        coopname: info.coopname,
      },
      pagination: {
        page: currentPage.value,
        limit: currentRowsPerPage.value,
        sortBy: currentSortBy.value,
        sortOrder: currentSortOrder.value,
      },
    });
  } catch (error) {
    console.warn('Ошибка при перезагрузке данных трекера в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startTrackerPoll, stop: stopTrackerPoll } = useDataPoller(
  reloadTrackerData,
  { interval: POLL_INTERVALS.MEDIUM, immediate: false }
);

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadIssuesExpandedState();

  // Запускаем poll обновление данных
  startTrackerPoll();
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(() => {
  stopTrackerPoll();
});
</script>
