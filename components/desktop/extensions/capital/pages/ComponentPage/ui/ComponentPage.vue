<template lang="pug">
div.column.full-height
  // Мобильный layout - колонки одна под другой
  div(v-if="isMobileLayout").column.full-height
    // Левая колонка с информацией о компоненте (сверху)
    div.q-pa-md
      ComponentSidebarWidget(
        :project="project"
        @field-change="handleFieldChange"
        @update:title="handleTitleUpdate"
      )

    // Правая колонка с контентом подстраниц (снизу)
    div.full-height.relative-position
      // Контент страницы компонента
      router-view

      // Floating Action Button
      Fab(v-if="project")

  // Десктопный layout - q-splitter с регулируемой шириной
  q-splitter(
    v-if="!isMobileLayout"
    v-model="sidebarWidth"
    :limits="[200, 800]"
    unit="px"
    separator-class="bg-grey-3"
    before-class="overflow-auto"
    after-class="overflow-auto"
    @update:model-value="saveSidebarWidth"
  )
    template(#before)
      // Левая колонка с информацией о компоненте
      ComponentSidebarWidget(
        :project="project"
        @field-change="handleFieldChange"
        @update:title="handleTitleUpdate"
      )

    template(#after)
      // Правая колонка с контентом подстраниц
      div.full-height.relative-position
        // Контент страницы компонента
        router-view

        // Floating Action Button
        Fab(v-if="project")
          template(#actions v-if="project?.permissions?.has_clearance")
            // Показываем кнопку создания задачи и требования, если пользователь имеет допуск к проекту
            CreateIssueFabAction(
              v-if="project?.permissions?.can_manage_issues"
              :project-hash="projectHash"
              @action-completed="handleIssueCreated"
            )
            CreateRequirementFabAction(
              :filter="{ project_hash: projectHash }"
              :permissions="project?.permissions"
              @action-completed="handleRequirementCreated"
            )
            SetPlanFabAction(
              v-if="project?.permissions?.can_set_plan"
              :project="project"
              @action-completed="handlePlanSet"
            )
            AddAuthorFabAction(
              v-if="project?.permissions?.can_manage_authors"
              :project="project"
              @action-completed="handleAuthorsAdded"
            )
            ComponentInvestFabAction(
              :project="project"
              @action-completed="handleInvestCompleted"
            )

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
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, markRaw, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWindowSize } from 'src/shared/hooks/useWindowSize';
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
import { ComponentSidebarWidget } from 'app/extensions/capital/widgets';

// Используем window size для определения размера экрана
const { isMobile } = useWindowSize();

// Управление шириной sidebar
const SIDEBAR_WIDTH_KEY = 'sidebar-width';
const DEFAULT_SIDEBAR_WIDTH = 300;

// Reactive переменная для ширины sidebar
const sidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);

// Загрузка ширины sidebar из localStorage
const loadSidebarWidth = () => {
  const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 200 && parsed <= 800) {
      sidebarWidth.value = parsed;
    }
  }
};

// Сохранение ширины sidebar в localStorage
const saveSidebarWidth = (width: number) => {
  localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString());
};

// Определение layout в зависимости от размера экрана
const isMobileLayout = isMobile;

// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();
const route = useRoute();
const router = useRouter();

// Массив кнопок меню для шапки
const menuButtons = computed(() => {
  const currentBackRoute = route.query._backRoute as string;
  const query = currentBackRoute ? { _backRoute: currentBackRoute } : {};

  return [
    {
      id: 'component-description-menu',
      component: markRaw(RouteMenuButton),
      props: {
        routeName: 'component-description',
        label: 'Описание',
        routeParams: { project_hash: projectHash.value },
        query,
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
        query,
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
        query,
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
        query,
      },
      order: 4,
    },
    {
      id: 'component-voting-menu',
      component: markRaw(RouteMenuButton),
      props: {
        routeName: 'component-voting',
        label: 'Голосование',
        routeParams: { project_hash: projectHash.value },
        query,
      },
      order: 5,
    },
    {
      id: 'component-results-menu',
      component: markRaw(RouteMenuButton),
      props: {
        routeName: 'component-results',
        label: 'Результаты',
        routeParams: { project_hash: projectHash.value },
        query,
      },
      order: 6,
    },
    {
      id: 'component-contributors-menu',
      component: markRaw(RouteMenuButton),
      props: {
        routeName: 'component-contributors',
        label: 'Участники',
        routeParams: { project_hash: projectHash.value },
        query,
      },
      order: 8,
    },
    {
      id: 'component-history-menu',
      component: markRaw(RouteMenuButton),
      props: {
        routeName: 'component-history',
        label: 'История',
        routeParams: { project_hash: projectHash.value },
        query,
      },
      order: 9,
    },
  ];
});

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'Назад',
  componentId: 'component-base-' + projectHash.value,
  onClick: () => {
    const backRoute = route.query._backRoute as string;
    if (backRoute) {
      // Проверяем, является ли backRoute ключом sessionStorage
      const storedRoute = sessionStorage.getItem(backRoute);
      if (storedRoute) {
        try {
          const routeData = JSON.parse(storedRoute);
          router.push({
            name: routeData.name,
            params: routeData.params,
            query: routeData.query
          });
          // Очищаем сохраненные данные
          sessionStorage.removeItem(backRoute);
          return;
        } catch (error) {
          console.warn('Failed to parse stored route:', error);
        }
      }
      // Если это обычное название маршрута, переходим стандартно
      router.push({ name: backRoute });
    } else {
      router.back();
    }
  }
});

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();

// Регистрируем действия в header
onMounted(async () => {
  // Загружаем сохраненную ширину sidebar
  loadSidebarWidth();

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

// Обработчик изменения полей в sidebar
const handleFieldChange = () => {
  // Просто триггер реактивности
};

// Обработчик обновления названия компонента в sidebar
const handleTitleUpdate = (value: string) => {
  if (project.value) {
    project.value.title = value;
  }
};

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
