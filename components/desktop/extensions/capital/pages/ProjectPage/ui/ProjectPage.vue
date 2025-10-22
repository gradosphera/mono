<template lang="pug">
div
  // Контент страницы проекта
  router-view

  // Floating Action Button для создания компонента
  Fab(v-if="project")
    template(#actions)
      CreateComponentFabAction(
        :project="project"
        @action-completed="handleComponentCreated"
      )
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, markRaw } from 'vue';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { RouteMenuButton, Fab } from 'src/shared/ui';
import { CreateComponentFabAction } from 'app/extensions/capital/features/Project/CreateComponent';

// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();

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
    id: 'project-requirements-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-requirements',
      label: 'Требования',
      routeParams: { project_hash: projectHash.value },
    },
    order: 2,
  },
  {
    id: 'project-components-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-components',
      label: 'Компоненты',
      routeParams: { project_hash: projectHash.value },
    },
    order: 3,
  },
  {
    id: 'project-planning-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-planning',
      label: 'Планирование',
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
      label: 'Участники',
      routeParams: { project_hash: projectHash.value },
    },
    order: 6,
  },

]);

// Настраиваем кнопку "Назад" на список проектов
useBackButton({
  text: 'Назад',
  routeName: 'projects-list',
  componentId: 'project-base-' + projectHash.value,
});

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();

// Регистрируем действия в header
onMounted(async () => {
  // Загружаем проект при монтировании (composable сделает это автоматически)
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


// Обработчик создания компонента
const handleComponentCreated = () => {
  // Можно добавить логику обновления списка компонентов
};


</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}

.text-h6 {
  margin-bottom: 4px;
}
</style>
