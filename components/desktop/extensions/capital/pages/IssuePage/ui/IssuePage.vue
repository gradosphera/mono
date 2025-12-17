<template lang="pug">
div(style="padding-bottom: 100px;")
  // Заголовок с информацией о задаче
  div(v-if="issue")
    .row.items-center.q-gutter-md.q-pa-md
      q-icon(name='task', size='32px', color='primary')
      .col
        IssueTitleEditor(
          :issue='issue'
          label='Задача'
          @field-change="handleFieldChange"
          @update:title="handleTitleUpdate"
        )

        IssueControls(
          :issue='issue'
          :permissions='issue?.permissions'
          @update:status='handleStatusUpdate'
          @update:priority='handlePriorityUpdate'
          @update:estimate='handleEstimateUpdate'
        )

  .text-h6(v-if="!issue") Загрузка...

  .row.items-center.q-gutter-md.q-mb-sm
    .col
      // Индикатор авто-сохранения
      AutoSaveIndicator(
        :is-auto-saving="isAutoSaving"
        :auto-save-error="autoSaveError"
      )

      Editor(
        v-if="issue"
        v-model='issue.description',
        label='Описание задачи',
        placeholder='Опишите задачу подробно...',
        :readonly="!issue?.permissions?.can_edit_issue"
        @change='handleDescriptionChange'
      )


</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FailAlert } from 'src/shared/api';
import { api as IssueApi } from 'app/extensions/capital/entities/Issue/api';
import type { IIssue } from 'app/extensions/capital/entities/Issue/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useRightDrawer } from 'src/shared/hooks/useRightDrawer';
import { StoriesWidget } from 'app/extensions/capital/widgets/StoryWidget';
// Утилиты для статусов и приоритетов теперь используются в компонентах UpdateStatus и UpdatePriority
import { Editor, AutoSaveIndicator } from 'src/shared/ui';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';
import { useUpdateIssue } from 'app/extensions/capital/features/Issue/UpdateIssue';
import { IssueControls, IssueTitleEditor } from 'app/extensions/capital/widgets';
const route = useRoute();

const issue = ref<IIssue | null>(null);
const loading = ref(false);

// Используем composable для обновления задач
const { debounceSave, isAutoSaving, autoSaveError } = useUpdateIssue();


// Получаем параметры из маршрута
const issueHash = computed(() => route.params.issue_hash as string);
const projectHash = computed(() => route.params.project_hash as string);


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

// Обработчик изменения полей
const handleFieldChange = () => {
  // Просто триггер реактивности для computed hasChanges в виджетах
};

// Обработчик обновления названия задачи
const handleTitleUpdate = (value: string) => {
  if (issue.value) {
    issue.value.title = value;
  }
};

// Обработчик изменения описания задачи
const handleDescriptionChange = () => {
  if (!issue.value) return;

  const updateData = {
    issue_hash: issue.value.issue_hash,
    description: issue.value.description,
  };

  // Запускаем авто-сохранение с задержкой
  debounceSave(updateData, projectHash.value);
};


// Хук для правого drawer'а
const { registerAction: registerRightDrawerAction } = useRightDrawer();

// Настраиваем кнопку "Назад"
// По умолчанию используем router.back(), но можно переопределить через query параметр _backRoute
useBackButton({
  text: 'Назад',
  routeName: route.query._backRoute as string || undefined,
  componentId: 'issue-page-' + issueHash.value,
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

    // Регистрируем StoriesWidget в правом drawer после загрузки задачи
    if (issue.value) {
      registerRightDrawerAction({
        id: 'issue-stories-' + issueHash.value,
        component: StoriesWidget,
        props: {
          filter: {
            issue_id: issue.value._id, // Только истории этой задачи
            project_hash: projectHash.value,
          },
          canCreate: true,
          maxItems: 20,
          emptyMessage: 'Требований к задаче пока нет',
        },
        order: 1,
      });

      // Регистрируем кнопку создания коммита в header

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
  }
};

const handlePriorityUpdate = (value: any) => {
  if (issue.value) {
    issue.value.priority = value;
  }
};

const handleEstimateUpdate = (value: number) => {
  if (issue.value) {
    issue.value.estimate = value;
  }
};

// Инициализация
onMounted(async () => {
  await loadIssue();
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
