<template lang="pug">
div
  // Список компонентов проекта
  ComponentsListWidget(
    :components='project?.components || []',
    :expanded='expandedComponents',
    @open-component='handleComponentClick',
    @toggle-component='handleComponentToggle'
  )
    template(#component-content='{ component }')
      IssuesListWidget(
        :project-hash='component.project_hash',
        @issue-click='handleIssueClick'
      )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { FailAlert } from 'src/shared/api';
import { useExpandableState } from 'src/shared/lib/composables';
import { ComponentsListWidget } from 'app/extensions/capital/widgets/ComponentsListWidget';
import { IssuesListWidget } from 'app/extensions/capital/widgets/IssuesListWidget';
import type { IIssue } from 'app/extensions/capital/entities/Issue/model';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

// Состояние проекта
const project = ref<IProject | null | undefined>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Композабл для управления состоянием развернутости компонентов
const {
  expanded: expandedComponents,
  loadExpandedState: loadComponentsExpandedState,
  toggleExpanded: toggleComponentExpanded,
} = useExpandableState('capital_project_components_expanded');

// Загрузка проекта из store (родитель уже должен загрузить)
const loadProject = async () => {
  // Ищем проект в store
  const foundProject = projectStore.projects.items.find(p => p.project_hash === projectHash.value);
  if (foundProject) {
    project.value = foundProject;
  } else {
    // Если проект не найден в store, пробуем загрузить
    try {
      await projectStore.loadProject({
        hash: projectHash.value,
      });
    } catch (error) {
      console.error('Ошибка при загрузке проекта:', error);
      FailAlert('Не удалось загрузить проект');
    }
  }
};

// Обработчик клика по компоненту
const handleComponentClick = (componentHash: string) => {
  router.push({
    name: 'project-tasks',
    params: {
      project_hash: componentHash,
    },
  });
};

// Обработчик переключения компонентов
const handleComponentToggle = (componentHash: string) => {
  toggleComponentExpanded(componentHash);
};

// Обработчик клика по задаче
const handleIssueClick = (issue: IIssue) => {
  router.push({
    name: 'project-issue',
    params: {
      project_hash: issue.project_hash,
      issue_hash: issue.issue_hash,
    },
  });
};

// Watcher для изменения projectHash
watch(projectHash, async (newHash, oldHash) => {
  if (newHash && newHash !== oldHash) {
    await loadProject();
  }
});

// Watcher для синхронизации локального состояния с store
watch(() => projectStore.projects.items, (newItems) => {
  if (newItems && projectHash.value) {
    const foundProject = newItems.find(p => p.project_hash === projectHash.value);
    if (foundProject) {
      project.value = foundProject;
    }
  }
}, { deep: true });

// Инициализация
onMounted(async () => {
  await loadProject();
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadComponentsExpandedState();
});
</script>

<style lang="scss" scoped>
</style>
