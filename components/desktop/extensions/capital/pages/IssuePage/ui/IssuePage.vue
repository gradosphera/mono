<template lang="pug">
div.column.full-height
  // Глобальный загрузчик для всей страницы
  WindowLoader(v-if="!issue" text="Загрузка задачи...")

  // Мобильный layout - колонки одна под другой
  div(v-if="isMobileLayout && issue").column.full-height
    // Левая колонка с информацией о задаче (сверху)
    div.q-pa-md
      IssueSidebarWidget(
        :issue="issue"
        :permissions="issue?.permissions"
        :parent-project="parentProject"
        @field-change="handleFieldChange"
        @update:title="handleTitleUpdate"
        @update:status="handleStatusUpdate"
        @update:priority="handlePriorityUpdate"
        @update:estimate="handleEstimateUpdate"
        @creators-set="handleCreatorsSet"
        @issue-updated="handleIssueUpdated"
      )

    // Правая колонка с контентом задачи (снизу)
    div.full-height.relative-position
      .row.items-center.q-gutter-md.q-mb-sm.q-pa-md
        .col
          // Индикатор авто-сохранения
          AutoSaveIndicator(
            :is-auto-saving="isAutoSaving"
            :auto-save-error="autoSaveError"
          )

          Editor(
            v-model='issue.description',
            label='Описание задачи',
            placeholder='Опишите задачу подробно...',
            :readonly="!issue?.permissions?.can_edit_issue"
            @change='handleDescriptionChange'
          )

      // Требования к задаче (только для мобильной версии)
      StoriesWidget(
        :filter="storiesFilter"
        canCreate
        :maxItems="20"
        emptyMessage="Требований к задаче пока нет"
      ).q-mt-md

      // История изменений задачи
      IssueLogsTableWidget(
        :issue-hash="issue.issue_hash"
        :refresh-trigger="logsRefreshTrigger"
      )

  // Десктопный layout - q-splitter с регулируемой шириной
  q-splitter(
    v-else-if="issue"
    v-model="sidebarWidth"
    :limits="[200, 800]"
    unit="px"
    separator-class="bg-grey-3"
    before-class="overflow-auto"
    after-class="overflow-auto"
    @update:model-value="saveSidebarWidth"
  )
    template(#before)
      // Левая колонка с информацией о задаче
      IssueSidebarWidget(
        :issue="issue"
        :permissions="issue?.permissions"
        :parent-project="parentProject"
        @field-change="handleFieldChange"
        @update:title="handleTitleUpdate"
        @update:status="handleStatusUpdate"
        @update:priority="handlePriorityUpdate"
        @update:estimate="handleEstimateUpdate"
        @creators-set="handleCreatorsSet"
        @issue-updated="handleIssueUpdated"
      )

    template(#after)
      // Правая колонка с контентом задачи
      div.full-height.relative-position
        .row.items-center.q-gutter-md.q-mb-sm.q-pa-md
          .col
            // Индикатор авто-сохранения
            AutoSaveIndicator(
              :is-auto-saving="isAutoSaving"
              :auto-save-error="autoSaveError"
            )

            Editor(
              v-model='issue.description',
              label='Описание задачи',
              placeholder='Опишите задачу подробно...',
              :readonly="!issue?.permissions?.can_edit_issue"
              @change='handleDescriptionChange'
            )

        // Требования к задаче показываются только в сайдбаре на десктопе

        q-separator.q-my-md
        // История изменений задачи
        IssueLogsTableWidget(
          :issue-hash="issue.issue_hash"
          :refresh-trigger="logsRefreshTrigger"
        )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWindowSize } from 'src/shared/hooks/useWindowSize';
import { FailAlert } from 'src/shared/api';
import { api as IssueApi } from 'app/extensions/capital/entities/Issue/api';
import { api as ProjectApi } from 'app/extensions/capital/entities/Project/api';
import type { IIssue } from 'app/extensions/capital/entities/Issue/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { Editor, AutoSaveIndicator } from 'src/shared/ui';
import { WindowLoader } from 'src/shared/ui/Loader';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';
import { useUpdateIssue } from 'app/extensions/capital/features/Issue/UpdateIssue';
import { IssueSidebarWidget, IssueLogsTableWidget, StoriesWidget } from 'app/extensions/capital/widgets';

const route = useRoute();
const router = useRouter();

// Используем Quasar и window size для определения размера экрана
const { isMobile } = useWindowSize();

const issue = ref<IIssue | null>(null);
const loading = ref(false);

// Информация о родительском элементе
const parentProject = ref<any>(null);

// Триггер для обновления логов задачи
const logsRefreshTrigger = ref(0);

// Управление шириной sidebar
const SIDEBAR_WIDTH_KEY = 'issue-sidebar-width';
const DEFAULT_SIDEBAR_WIDTH = 400;

// Reactive переменная для ширины sidebar
const sidebarWidth = ref(DEFAULT_SIDEBAR_WIDTH);

// Загрузка ширины sidebar из localStorage
const loadSidebarWidth = () => {
  const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 350 && parsed <= 600) {
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

// Фильтр для StoriesWidget
const storiesFilter = computed(() => {
  if (!issue.value) return {}
  return {
    issue_hash: issue.value.issue_hash,
    project_hash: issue.value.project_hash
  }
});

// Используем composable для обновления задач
const { debounceSave, isAutoSaving, autoSaveError } = useUpdateIssue();

// Получаем параметры из маршрута
const issueHash = computed(() => route.params.issue_hash as string);
const projectHash = computed(() => route.params.project_hash as string);
const parentHash = computed(() => projectHash.value);

// Проверяем и конвертируем описание в EditorJS формат если необходимо
const ensureEditorJSFormat = (description: any) => {
  if (!description) return '{}';

  // Если это уже строка, пробуем распарсить как JSON
  if (typeof description === 'string') {
    try {
      JSON.parse(description);
      return description; // Уже валидный JSON
    } catch {
      // Не JSON, конвертируем из текста
      return textToEditorJS(description);
    }
  }

  // Если объект, конвертируем в строку
  if (typeof description === 'object') {
    return JSON.stringify(description);
  }

  // Если что-то другое, конвертируем как текст
  return textToEditorJS(String(description));
};

// Загрузка информации о родительском элементе
const loadParentInfo = async () => {
  try {
    const projectData = await ProjectApi.loadProject({
      hash: parentHash.value,
    });

    if (projectData) {
      parentProject.value = projectData;
    }
  } catch (error) {
    console.error('Ошибка при загрузке информации о родителе:', error);
    parentProject.value = null;
  }
};

// Обработчик изменения полей
const handleFieldChange = () => {
  // Просто триггер реактивности для computed hasChanges в виджетах
};

// Обработчик обновления названия задачи
const handleTitleUpdate = async (value: string) => {
  if (issue.value) {
    issue.value.title = value;

    // Отправляем мутацию на обновление названия
    const updateData = {
      issue_hash: issue.value.issue_hash,
      title: value,
    };

    try {
      await debounceSave(updateData, projectHash.value);
      // Обновляем логи после успешного сохранения
      logsRefreshTrigger.value++;
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  }
};

// Обработчик изменения описания задачи
const handleDescriptionChange = async () => {
  if (!issue.value) return;

  const updateData = {
    issue_hash: issue.value.issue_hash,
    description: issue.value.description,
  };

  try {
    // Запускаем авто-сохранение с задержкой
    await debounceSave(updateData, projectHash.value);
    // Обновляем логи после успешного сохранения
    logsRefreshTrigger.value++;
  } catch (error) {
    console.error('Failed to update description:', error);
  }
};

// Убрали правый drawer - StoriesWidget теперь в сайдбаре

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'Назад',
  componentId: 'issue-page-' + issueHash.value,
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

// Загрузка задачи
const loadIssue = async () => {
  loading.value = true;
  try {
    console.log('Загрузка задачи:', issueHash.value);

    // Получаем задачу по HASH
    const issueData = await IssueApi.loadIssue({
      issue_hash: issueHash.value,
    });

    issue.value = issueData || null;

    // Конвертируем описание в EditorJS формат если необходимо
    if (issue.value?.description) {
      issue.value.description = ensureEditorJSFormat(issue.value.description);
    }
  } catch (error) {
    console.error('Ошибка при загрузке задачи:', error);
    FailAlert('Не удалось загрузить задачу');
  } finally {
    loading.value = false;
  }
};

// Обработчики обновления полей задачи
const handleStatusUpdate = (value: any) => {
  if (issue.value) {
    issue.value.status = value;
    // Обновляем логи после изменения статуса
    logsRefreshTrigger.value++;
  }
};

const handlePriorityUpdate = (value: any) => {
  if (issue.value) {
    issue.value.priority = value;
    // Обновляем логи после изменения приоритета
    logsRefreshTrigger.value++;
  }
};

const handleEstimateUpdate = (value: number) => {
  if (issue.value) {
    issue.value.estimate = value;
    // Обновляем логи после изменения оценки
    logsRefreshTrigger.value++;
  }
};

const handleCreatorsSet = (creators: any[]) => {
  if (issue.value) {
    // Обновляем список создателей в локальном состоянии
    issue.value.creators = creators.map(c => c.username);
    // Обновляем логи после изменения ответственных
    logsRefreshTrigger.value++;
  }
};

const handleIssueUpdated = (updatedIssue: any) => {
  if (updatedIssue && issue.value) {
    // Обновляем локальную задачу обновленными данными
    issue.value = { ...issue.value, ...updatedIssue };
  }
};

// Инициализация
onMounted(async () => {
  // Загружаем сохраненную ширину sidebar
  loadSidebarWidth();

  // Загружаем информацию о родителе
  await loadParentInfo();

  // Загружаем задачу
  await loadIssue();
});
</script>

<style lang="scss" scoped>
</style>
