<template lang="pug">
div.column.full-height
  // Глобальный загрузчик для всей страницы
  WindowLoader(v-if="!project" text="Загрузка проекта...")

  // Мобильный layout - колонки одна под другой
  div(v-if="isMobileLayout && project").column.full-height
    // Левая колонка с информацией о проекте (сверху)
    div.q-pa-md
      ProjectSidebarWidget(
        :project="project"
        @field-change="handleFieldChange"
        @update:title="handleTitleUpdate"
      )

    // Правая колонка с контентом подстраниц (снизу)
    div.full-height.relative-position
      // Контент страницы проекта
      router-view

      // Floating Action Button для создания компонента, требования и установки плана
      Fab(v-if="project")

  // Десктопный layout - q-splitter с регулируемой шириной
  q-splitter(
    v-if="!isMobileLayout && project"
    v-model="sidebarWidth"
    :limits="[200, 800]"
    unit="px"
    separator-class="bg-grey-3"
    before-class="overflow-auto"
    after-class="overflow-auto"
    @update:model-value="saveSidebarWidth"
  )
    template(#before)
      // Левая колонка с информацией о проекте
      ProjectSidebarWidget(
        :project="project"
        @field-change="handleFieldChange"
        @update:title="handleTitleUpdate"
      )

    template(#after)
      // Правая колонка с контентом подстраниц
      div.full-height.relative-position
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
import { CreateComponentFabAction } from 'app/extensions/capital/features/Project/CreateComponent';
import { CreateRequirementFabAction } from 'app/extensions/capital/features/Story/CreateStory';
// import { SetPlanFabAction } from 'app/extensions/capital/features/Project/SetPlan';
import { ProjectInvestFabAction } from 'app/extensions/capital/features/Invest/CreateProjectInvest';
import { AddAuthorFabAction } from 'app/extensions/capital/features/Project/AddAuthor';
import { MakeClearanceButton } from 'app/extensions/capital/features/Contributor/MakeClearance';
import { PendingClearanceButton } from 'app/extensions/capital/shared/ui/PendingClearanceButton';
import { ProjectSidebarWidget } from 'app/extensions/capital/widgets';
import { WindowLoader } from 'src/shared/ui/Loader';

// Используем window size для определения размера экрана
const { isMobile } = useWindowSize();

// Управление шириной sidebar
const SIDEBAR_WIDTH_KEY = 'capital-sidebar-width';
const DEFAULT_SIDEBAR_WIDTH = 350;

// Reactive переменная для ширины sidebar
const sidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);

// Загрузка ширины sidebar из localStorage
const loadSidebarWidth = () => {
  const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 300 && parsed <= 800) {
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
  {
    id: 'project-history-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'project-history',
      label: 'История',
      routeParams: { project_hash: projectHash.value },
    },
    order: 7,
  },

]);

// Настраиваем кнопку "Назад"
const { setBackButton } = useBackButton({
  text: 'Назад',
  componentId: 'project-base-' + projectHash.value,
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
      router.push({ name: 'projects-list' });
    }
  }
});

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();


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

// Обработчик изменения полей в sidebar
const handleFieldChange = () => {
  // Просто триггер реактивности
};

// Обработчик обновления названия проекта в sidebar
const handleTitleUpdate = (value: string) => {
  if (project.value) {
    project.value.title = value;
  }
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
  // Загружаем сохраненную ширину sidebar
  loadSidebarWidth();

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
