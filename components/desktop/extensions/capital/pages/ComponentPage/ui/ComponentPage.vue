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

  // Floating Action Button
  Fab(v-if="project")
    template(#actions v-if="project?.permissions?.has_clearance")
      // Показываем кнопку создания задачи, если пользователь имеет допуск к проекту
      CreateIssueFabAction(
        :project-hash="projectHash"
        @action-completed="handleIssueCreated"
      )
    template

    template(#default v-if="!project?.permissions?.has_clearance")
      // Показываем кнопку участия, если пользователь не имеет допуска к проекту
      MakeClearanceButton(
        :project="project"
        fab
      )
    template
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, markRaw } from 'vue';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { RouteMenuButton, Fab } from 'src/shared/ui';
import { ProjectControls, ProjectTitleEditor } from 'app/extensions/capital/widgets';
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

// Обработчик создания задачи
const handleIssueCreated = () => {
  // Можно добавить логику обновления списка задач
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
