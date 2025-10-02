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
        :expand-all='expandAll',
        :has-issues-with-statuses='hasIssuesWithStatuses',
        :has-issues-with-priorities='hasIssuesWithPriorities',
        :has-issues-with-creators='hasIssuesWithCreators',
        :master='master',
        @toggle-expand='handleProjectToggleExpand',
        @project-click='handleProjectClick',
        @data-loaded='handleProjectsDataLoaded'
      )

        template(#project-content='{ project }')
          ComponentsListWidget(
            :components='project.components',
            :expanded='expandedComponents',
            :expand-all='expandAll',
            @open-component='(componentHash) => router.push({ name: "project-tasks", params: { project_hash: componentHash } })',
            @toggle-component='handleComponentToggle'
          )
            template(#component-content='{ component }')
              IssuesListWidget(
                :project-hash='component.project_hash',
                :statuses='componentStatuses',
                :priorities='componentPriorities',
                :creators='componentCreators',
                :master='componentMaster',
                @issue-click='(issue) => router.push({ name: "project-issue", params: { project_hash: issue.project_hash, issue_hash: issue.issue_hash } })'
              )
</template>

<script lang="ts" setup>
import { onMounted, markRaw, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useHeaderActions } from 'src/shared/hooks';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { CreateProjectButton } from 'app/extensions/capital/features/Project/CreateProject';
import { ProjectsListWidget, ComponentsListWidget, IssuesListWidget, ListFilterWidget } from 'app/extensions/capital/widgets';
import { useProjectFilters } from 'app/extensions/capital/widgets/ListFilterWidget/useProjectFilters';

const router = useRouter();

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

// Регистрируем кнопку создания проекта в header
const { registerAction } = useHeaderActions();

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

// Состояние опции "развернуть всё"
const expandAll = ref(false);

// Состояние для подсчета общего количества элементов
const totalProjectsCount = ref(0);
const totalComponentsCount = ref(0);

// Количество компонентов теперь подсчитывается в handleProjectsDataLoaded

// Отслеживаем изменения в развернутых состояниях для сброса expandAll
watch([() => expanded.value, () => expandedComponents.value], () => {
  if (expandAll.value) {
    // Проверяем, все ли элементы действительно развернуты
    const allProjectsExpanded = totalProjectsCount.value > 0 &&
      Object.values(expanded.value).filter(Boolean).length === totalProjectsCount.value;

    const allComponentsExpanded = totalComponentsCount.value > 0 &&
      Object.values(expandedComponents.value).filter(Boolean).length === totalComponentsCount.value;

    // Если не все развернуты, сбрасываем expandAll
    if (!allProjectsExpanded || !allComponentsExpanded) {
      expandAll.value = false;
    }
  }
}, { deep: true });

const handleProjectClick = (projectHash: string) => {
  // Клик на строку проекта приводит к развороту/свертыванию
  toggleProjectExpanded(projectHash);
};

const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleComponentToggle = (componentHash: string) => {
  toggleComponentExpanded(componentHash);
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

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadComponentsExpandedState();

  registerAction({
    id: 'create-project',
    component: markRaw(CreateProjectButton),
    order: 1,
  });
});
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}
</style>
