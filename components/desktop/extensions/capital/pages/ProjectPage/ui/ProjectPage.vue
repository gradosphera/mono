<template lang="pug">
div
  // Заголовок с информацией о проекте
  div(v-if="project")
    .row.items-center.q-gutter-md.q-pa-md
      q-icon(name='folder', size='32px', color='primary')
      .col
        ProjectTitleEditor(
          :project='project'
          @field-change="handleFieldChange"
          @update:title="handleTitleUpdate"
        )

        ProjectControls(:project='project')

  // Контент страницы проекта
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
    id: 'project-description-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-description',
      label: 'Описание',
      routeParams: { project_hash: projectHash.value },
    },
    order: 1,
  },
  {
    id: 'project-components-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-components',
      label: 'Компоненты',
      routeParams: { project_hash: projectHash.value },
    },
    order: 2,
  },
  {
    id: 'project-invite-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-invite-editor',
      label: 'Приглашение',
      routeParams: { project_hash: projectHash.value },
    },
    order: 3,
  },
  {
    id: 'project-planning-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-planning',
      label: 'Финансирование',
      routeParams: { project_hash: projectHash.value },
    },
    order: 4,
  },
  {
    id: 'project-authors-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-authors',
      label: 'Соавторы',
      routeParams: { project_hash: projectHash.value },
    },
    order: 5,
  },
  {
    id: 'project-contributors-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-contributors',
      label: 'Вкладчики',
      routeParams: { project_hash: projectHash.value },
    },
    order: 6,
  },
  {
    id: 'project-requirements-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-requirements',
      label: 'Требования',
      routeParams: { project_hash: projectHash.value },
    },
    order: 7,
  },
]);

// Настраиваем кнопку "Назад" на список проектов
useBackButton({
  text: 'К проектам',
  routeName: 'projects-list',
  componentId: 'project-base-' + projectHash.value,
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
    console.error('Ошибка при загрузке проекта:', error);
    FailAlert('Не удалось загрузить проект');
  }
};

// Обработчик изменения полей
const handleFieldChange = () => {
  // Просто триггер реактивности для computed hasChanges в виджетах
};

// Обработчик обновления названия проекта
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
}, { deep: true });


</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}

.text-h6 {
  margin-bottom: 4px;
}
</style>
