<template lang="pug">
div
  // Контент страницы компонента
  router-view

  // Floating Action Button
  Fab(v-if="project")
    template(#actions v-if="project?.permissions?.has_clearance")
      // Показываем кнопку создания задачи и требования, если пользователь имеет допуск к проекту
      CreateIssueFabAction(
        :project-hash="projectHash"
        @action-completed="handleIssueCreated"
      )
      CreateRequirementFabAction(
        :filter="{ project_hash: projectHash }"
        @action-completed="handleRequirementCreated"
      )
      SetPlanFabAction(
        v-if="project?.permissions?.can_set_plan"
        :project="project"
        @action-completed="handlePlanSet"
      )
      AddAuthorFabAction(
        :project="project"
        @action-completed="handleAuthorsAdded"
      )
      ComponentInvestFabAction(
        :project="project"
        @action-completed="handleInvestCompleted"
      )
    template

    template(#default v-if="project?.permissions?.pending_clearance")
      // Показываем кнопку ожидания, если запрос на допуск в рассмотрении
      PendingClearanceButton
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
import { onMounted, onBeforeUnmount, computed, markRaw, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { RouteMenuButton, Fab } from 'src/shared/ui';
import { useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
import { CreateIssueFabAction } from 'app/extensions/capital/features/Issue/CreateIssue';
import { CreateRequirementFabAction } from 'app/extensions/capital/features/Story/CreateStory';
import { MakeClearanceButton } from 'app/extensions/capital/features/Contributor/MakeClearance';
import { SetPlanFabAction } from 'app/extensions/capital/features/Project/SetPlan';
import { ComponentInvestFabAction } from 'app/extensions/capital/features/Invest/CreateProjectInvest';
import { AddAuthorFabAction } from 'app/extensions/capital/features/Project/AddAuthor';
import { PendingClearanceButton } from 'app/extensions/capital/shared/ui/PendingClearanceButton';
// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();
const route = useRoute();

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
      label: 'План',
      routeParams: { project_hash: projectHash.value },
    },
    order: 4,
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
  {
    id: 'component-history-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'component-history',
      label: 'История',
      routeParams: { project_hash: projectHash.value },
    },
    order: 7,
  },
]);

// Настраиваем кнопку "Назад"
const { setBackButton } = useBackButton({
  text: 'Назад',
  routeName: route.query._backRoute as string || undefined,
  componentId: 'component-base-' + projectHash.value,
});

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();

// Регистрируем действия в header
onMounted(async () => {
  await loadProject();

  // Регистрируем кнопки меню только если мы НЕ на странице задачи
  if (route.name !== 'component-issue') {
    menuButtons.value.forEach(button => {
      registerHeaderAction(button);
    });
  }
});

// Явно очищаем кнопки при уходе со страницы
onBeforeUnmount(() => {
  clearActions();
});

// Отслеживаем изменение backRoute для обновления кнопки "Назад"
watch(() => route.query._backRoute, () => {
  setBackButton();
});

// Отслеживаем переходы на дочерние маршруты (например, на страницу задачи)
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'component-issue') {
    // Если перешли на страницу задачи - очищаем кнопки меню компонента
    clearActions();
  } else if (newRouteName && newRouteName.toString().startsWith('component-') && newRouteName !== 'component-base') {
    // Если вернулись на страницы компонента - регистрируем кнопки снова
    menuButtons.value.forEach(button => {
      registerHeaderAction(button);
    });
  }
});


// Обработчик создания задачи
const handleIssueCreated = () => {
  // Можно добавить логику обновления списка задач
};

// Обработчик создания требования
const handleRequirementCreated = () => {
  // Можно добавить логику обновления списка требований
};

// Обработчик установки плана
const handlePlanSet = () => {
  // Можно добавить логику обновления данных проекта
};

// Обработчик добавления соавторов
const handleAuthorsAdded = () => {
  // Можно добавить логику обновления данных проекта
};

// Обработчик создания инвестиции
const handleInvestCompleted = () => {
  // Можно добавить логику обновления данных проекта
};

// Обработчик успешной отправки запроса на допуск
const handleClearanceSubmitted = async () => {
  // Обновляем данные проекта, чтобы отразить изменения в разрешениях
  await loadProject();
};

/**
 * Функция для перезагрузки данных проекта
 * Используется для poll обновлений
 */
const reloadProjectData = async () => {
  try {
    // Перезагружаем данные текущего проекта
    await loadProject();
  } catch (error) {
    console.warn('Ошибка при перезагрузке данных проекта в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startProjectPoll, stop: stopProjectPoll } = useDataPoller(
  reloadProjectData,
  { interval: POLL_INTERVALS.MEDIUM, immediate: false }
);

// Регистрируем действия в header
onMounted(async () => {
  // Загружаем проект при монтировании (composable сделает это автоматически)
  await loadProject();

  // Запускаем poll обновление данных
  startProjectPoll();

  // Регистрируем кнопки меню только если мы НЕ на странице задачи
  if (route.name !== 'component-issue') {
    menuButtons.value.forEach(button => {
      registerHeaderAction(button);
    });
  }
});

// Явно очищаем кнопки при уходе со страницы
onBeforeUnmount(() => {
  stopProjectPoll();
  clearActions();
});

// Отслеживаем изменение backRoute для обновления кнопки "Назад"
watch(() => route.query._backRoute, () => {
  setBackButton();
});

// Отслеживаем переходы на дочерние маршруты (например, на страницу задачи)
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'component-issue') {
    // Если перешли на страницу задачи - очищаем кнопки меню компонента
    clearActions();
  } else if (newRouteName && newRouteName.toString().startsWith('component-') && newRouteName !== 'component-base') {
    // Если вернулись на страницы компонента - регистрируем кнопки снова
    menuButtons.value.forEach(button => {
      registerHeaderAction(button);
    });
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
