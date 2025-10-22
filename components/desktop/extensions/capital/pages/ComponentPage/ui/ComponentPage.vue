<template lang="pug">
div
  // Контент страницы компонента
  router-view

  // Floating Action Button
  Fab(v-if="project")
    template(#actions v-if="project?.permissions?.has_clearance")
      // Показываем кнопку создания задачи, если пользователь имеет допуск к проекту
      CreateIssueFabAction(
        :project-hash="projectHash"
        @action-completed="handleIssueCreated"
      )
    template

    template(#default v-if="project?.permissions?.pending_clearance")
      // Показываем кнопку ожидания, если запрос на допуск в рассмотрении
      q-btn(
        color="black"
        label="Ожидание"
        icon="schedule"
        disable
        fab
      )
    template(#default v-else-if="!project?.permissions?.has_clearance")
      // Показываем кнопку участия, если пользователь не имеет допуска к проекту
      MakeClearanceButton(
        :project="project"
        fab
        @clearance-submitted="handleClearanceSubmitted"
      )
    template
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, markRaw } from 'vue';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { RouteMenuButton, Fab } from 'src/shared/ui';
import { CreateIssueFabAction } from 'app/extensions/capital/features/Issue/CreateIssue';
import { MakeClearanceButton } from 'app/extensions/capital/features/Contributor/MakeClearance';
// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();

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
    id: 'component-requirements-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-requirements',
      label: 'Требования',
      routeParams: { project_hash: projectHash.value },
    },
    order: 3,
  },
  {
    id: 'component-planning-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-planning',
      label: 'Планирование',
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
      label: 'Участники',
      routeParams: { project_hash: projectHash.value },
    },
    order: 6,
  },
]);

// Настраиваем кнопку "Назад"
// По умолчанию используем router.back(), но можно переопределить через query параметр _backRoute
useBackButton({
  text: 'Назад',
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


// Обработчик создания задачи
const handleIssueCreated = () => {
  // Можно добавить логику обновления списка задач
};

// Обработчик успешной отправки запроса на допуск
const handleClearanceSubmitted = async () => {
  // Обновляем данные проекта, чтобы отразить изменения в разрешениях
  await loadProject();
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
