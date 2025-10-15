<template lang="pug">
div
  // Заголовок с информацией о компоненте
  div(v-if="project")
    .row.items-center.q-gutter-md.q-pa-md
      q-icon(name='task', size='32px', color='primary')
      .col
        ProjectTitleEditor(
          :project='project'
          @field-change="handleFieldChange"
          @update:title="handleTitleUpdate"
        )

        ProjectControls(:project='project')

  // Контент страницы компонента
  router-view
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed, markRaw, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { FailAlert } from 'src/shared/api';
import { RouteMenuButton } from 'src/shared/ui';
import { ProjectControls, ProjectTitleEditor } from 'app/extensions/capital/widgets';
const route = useRoute();
const projectStore = useProjectStore();

const project = ref<IProject | null | undefined>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Массив кнопок меню для шапки
const menuButtons = computed(() => [
  {
    id: 'component-description-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-description',
      label: 'Описание',
      routeParams: { project_hash: projectHash.value },
    },
    order: 1,
  },
  {
    id: 'component-tasks-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-tasks',
      label: 'Задачи',
      routeParams: { project_hash: projectHash.value },
    },
    order: 2,
  },
  {
    id: 'component-invite-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-invite-editor',
      label: 'Приглашение',
      routeParams: { project_hash: projectHash.value },
    },
    order: 3,
  },
  {
    id: 'component-planning-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-planning',
      label: 'Финансирование',
      routeParams: { project_hash: projectHash.value },
    },
    order: 4,
  },
  {
    id: 'component-authors-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-authors',
      label: 'Соавторы',
      routeParams: { project_hash: projectHash.value },
    },
    order: 5,
  },
  {
    id: 'component-contributors-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-contributors',
      label: 'Вкладчики',
      routeParams: { project_hash: projectHash.value },
    },
    order: 6,
  },
  {
    id: 'component-requirements-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-requirements',
      label: 'Требования',
      routeParams: { project_hash: projectHash.value },
    },
    order: 7,
  },
]);

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'К проекту',
  routeName: 'project-components',
  componentId: 'component-base-' + projectHash.value,
});

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();

// Регистрируем действия в header
onMounted(async () => {
  await loadProject();

  // Регистрируем кнопки меню
  menuButtons.value.forEach(button => {
    registerHeaderAction(button);
  });
});

// Явно очищаем кнопки при уходе со страницы
onBeforeUnmount(() => {
  clearActions();
});

// Загрузка проекта
const loadProject = async () => {
  try {
    await projectStore.loadProject({
      hash: projectHash.value,
    });
  } catch (error) {
    console.error('Ошибка при загрузке компонента:', error);
    FailAlert('Не удалось загрузить компонент');
  }
};

// Обработчик изменения полей
const handleFieldChange = () => {
  // Просто триггер реактивности для computed hasChanges в виджетах
};

// Обработчик обновления названия компонента
const handleTitleUpdate = (value: string) => {
  if (project.value) {
    project.value.title = value;
  }
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
});
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}

.text-h6 {
  margin-bottom: 4px;
}
</style>
