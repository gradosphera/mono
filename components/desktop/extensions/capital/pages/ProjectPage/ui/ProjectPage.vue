<template lang="pug">
div
  // Контент страницы проекта
  router-view

  // Floating Action Button для создания компонента, требования и установки плана
  Fab(v-if="project")
    template(#actions v-if="project?.permissions?.has_clearance")
      CreateComponentFabAction(
        v-if="project?.permissions?.can_edit_project"
        :project="project"
        @action-completed="handleComponentCreated"
      )
      CreateRequirementFabAction(
        v-if="project?.permissions?.can_edit_project"

        :filter="{ project_hash: projectHash }"
        @action-completed="handleRequirementCreated"
      )
      //- SetPlanFabAction(
      //-   v-if="project?.permissions?.can_set_plan"
      //-   :project="project"
      //-   @action-completed="handlePlanSet"
      //- )
      AddAuthorFabAction(
        v-if="project?.permissions?.can_manage_authors"
        :project="project"
        @action-completed="handleAuthorsAdded"
      )
      ProjectInvestFabAction(
        :project="project"
        @action-completed="handleInvestCompleted"
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
import { CreateComponentFabAction } from 'app/extensions/capital/features/Project/CreateComponent';
import { CreateRequirementFabAction } from 'app/extensions/capital/features/Story/CreateStory';
// import { SetPlanFabAction } from 'app/extensions/capital/features/Project/SetPlan';
import { ProjectInvestFabAction } from 'app/extensions/capital/features/Invest/CreateProjectInvest';
import { AddAuthorFabAction } from 'app/extensions/capital/features/Project/AddAuthor';
import { MakeClearanceButton } from 'app/extensions/capital/features/Contributor/MakeClearance';

// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();
const route = useRoute();

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
  // {
  //   id: 'project-planning-menu',
  //   component: markRaw(RouteMenuButton),
  //   props: {
  //     routeName: 'project-planning',
  //     label: 'План',
  //     routeParams: { project_hash: projectHash.value },
  //   },
  //   order: 4,
  // },
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

// Настраиваем кнопку "Назад"
const { setBackButton } = useBackButton({
  text: 'Назад',
  routeName: route.query._backRoute as string || 'projects-list',
  componentId: 'project-base-' + projectHash.value,
});

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();

// Регистрируем действия в header
onMounted(async () => {
  // Загружаем проект при монтировании (composable сделает это автоматически)
  await loadProject();

  // Регистрируем кнопки меню только если мы НЕ на странице задачи
  if (route.name !== 'project-issue') {
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
  if (newRouteName === 'project-issue') {
    // Если перешли на страницу задачи - очищаем кнопки меню проекта
    clearActions();
  } else if (newRouteName && newRouteName.toString().startsWith('project-') && newRouteName !== 'project-base') {
    // Если вернулись на страницы проекта - регистрируем кнопки снова
    menuButtons.value.forEach(button => {
      registerHeaderAction(button);
    });
  }
});


// Обработчик создания компонента
const handleComponentCreated = () => {
  // Можно добавить логику обновления списка компонентов
};

// Обработчик создания требования
const handleRequirementCreated = () => {
  // Можно добавить логику обновления списка требований
};

// Обработчик установки плана
// const handlePlanSet = () => {
  // Можно добавить логику обновления данных проекта
// };

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
  if (route.name !== 'project-issue') {
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
  if (newRouteName === 'project-issue') {
    // Если перешли на страницу задачи - очищаем кнопки меню проекта
    clearActions();
  } else if (newRouteName && newRouteName.toString().startsWith('project-') && newRouteName !== 'project-base') {
    // Если вернулись на страницы проекта - регистрируем кнопки снова
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
