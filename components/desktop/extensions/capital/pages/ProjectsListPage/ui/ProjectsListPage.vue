<template lang="pug">
div
  q-card(flat)
    div
      // Виджет фильтрации
      ListFilterWidget.mb-4(
        @filters-changed='handleFiltersChanged'
      )

      // Виджет списка проектов
      ProjectsListWidget(
        :key='projectsListKey',
        :expanded='expanded',
        :has-issues-with-statuses='hasIssuesWithStatuses',
        :has-issues-with-priorities='hasIssuesWithPriorities',
        :has-issues-with-creators='hasIssuesWithCreators',
        :master='master',
        @toggle-expand='handleProjectToggleExpand',
        @data-loaded='handleProjectsDataLoaded',
        @open-project='handleOpenProject'
        @pagination-changed='handlePaginationChanged'
      )
        template(#project-content='{ project }')
          ComponentsListWidget(
            :components='project.components',
            :expanded='expandedComponents',
            @open-component='(componentHash) => router.push({ name: "component-description", params: { project_hash: componentHash }, query: { _backRoute: "projects-list" } })',
            @toggle-component='handleComponentToggle'
          )
            template(#component-content='{ component }')
              IssuesListWidget(
                :project-hash='component.project_hash',
                :statuses='componentStatuses',
                :priorities='componentPriorities',
                :creators='componentCreators',
                :master='componentMaster',
                @issue-click='(issue) => router.push({ name: "component-issue", params: { project_hash: issue.project_hash, issue_hash: issue.issue_hash }, query: { _backRoute: "projects-list" } })'
              )

  // Floating Action Button для создания проекта
  Fab(v-if='currentUser.isChairman || currentUser.isMember')
    template(#actions)
      CreateProjectFabAction
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useExpandableState, useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
import 'src/shared/ui/TitleStyles';
import { Fab } from 'src/shared/ui';
import { CreateProjectFabAction } from 'app/extensions/capital/features/Project/CreateProject';
import { ProjectsListWidget, ComponentsListWidget, IssuesListWidget, ListFilterWidget } from 'app/extensions/capital/widgets';
import { useProjectFilters } from 'app/extensions/capital/widgets/ListFilterWidget/useProjectFilters';
import { useCurrentUser } from 'src/entities/Session';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

const router = useRouter();
const currentUser = useCurrentUser();
const projectStore = useProjectStore();

// Используем композабл для управления фильтрами
const {
  hasIssuesWithStatuses,
  hasIssuesWithPriorities,
  hasIssuesWithCreators,
  master,
  componentStatuses,
  componentPriorities,
  componentCreators,
  componentMaster,
  projectsListKey,
  handleFiltersChanged,
} = useProjectFilters();

// Ключи для сохранения состояния в LocalStorage
const PROJECTS_EXPANDED_KEY = 'capital_projects_expanded';
const COMPONENTS_EXPANDED_KEY = 'capital_project_components_expanded';

// Управление развернутостью проектов
const {
  expanded,
  loadExpandedState: loadProjectsExpandedState,
  cleanupExpandedByKeys: cleanupProjectsExpanded,
  toggleExpanded: toggleProjectExpanded,
} = useExpandableState(PROJECTS_EXPANDED_KEY);

// Управление развернутостью компонентов
const {
  expanded: expandedComponents,
  loadExpandedState: loadComponentsExpandedState,
  toggleExpanded: toggleComponentExpanded,
} = useExpandableState(COMPONENTS_EXPANDED_KEY);

// Состояние для подсчета общего количества элементов
const totalProjectsCount = ref(0);
const totalComponentsCount = ref(0);

// Текущее состояние пагинации для poll обновлений
const currentPage = ref(1);
const currentRowsPerPage = ref(25);
const currentSortBy = ref('_created_at');
const currentDescending = ref(true);

// Количество компонентов теперь подсчитывается в handleProjectsDataLoaded


const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleComponentToggle = (componentHash: string) => {
  toggleComponentExpanded(componentHash);
};

const handleOpenProject = (projectHash: string) => {
  router.push({ name: 'project-description', params: { project_hash: projectHash }, query: { _backRoute: 'projects-list' } });
};

const handleProjectsDataLoaded = (projectHashes: string[], totalComponents?: number) => {
  // Очищаем устаревшие записи expanded проектов после загрузки данных
  cleanupProjectsExpanded(projectHashes);

  // Сохраняем количество проектов для indeterminate логики
  totalProjectsCount.value = projectHashes.length;

  // Сохраняем общее количество компонентов
  if (totalComponents !== undefined) {
    totalComponentsCount.value = totalComponents;
  }
};

const handlePaginationChanged = (paginationData: { page: number; rowsPerPage: number; sortBy: string; descending: boolean }) => {
  // Сохраняем текущую пагинацию для poll обновлений
  currentPage.value = paginationData.page;
  currentRowsPerPage.value = paginationData.rowsPerPage;
  currentSortBy.value = paginationData.sortBy;
  currentDescending.value = paginationData.descending;
};

/**
 * Функция для перезагрузки данных проектов с текущими фильтрами
 * Используется для poll обновлений
 */
const reloadProjects = async () => {
  try {
    const filter: any = {
      coopname: '',
      parent_hash: '',
    };

    // Добавляем текущие фильтры
    if (hasIssuesWithStatuses.value?.length) {
      filter.has_issues_with_statuses = hasIssuesWithStatuses.value;
    }
    if (hasIssuesWithPriorities.value?.length) {
      filter.has_issues_with_priorities = hasIssuesWithPriorities.value;
    }
    if (master.value) {
      filter.master = master.value;
    }

    await projectStore.loadProjects({
      filter,
      pagination: {
        page: currentPage.value,
        limit: currentRowsPerPage.value,
        sortBy: currentSortBy.value,
        descending: currentDescending.value,
      },
    });
  } catch (error) {
    console.warn('Ошибка при перезагрузке проектов в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startProjectsPoll, stop: stopProjectsPoll } = useDataPoller(
  reloadProjects,
  { interval: POLL_INTERVALS.MEDIUM, immediate: false }
);

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadComponentsExpandedState();

  // Запускаем poll обновление данных
  startProjectsPoll();
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(() => {
  stopProjectsPoll();
});
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}
</style>
