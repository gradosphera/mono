<template lang="pug">
div(style="padding-bottom: 100px;")
  // Заголовок с информацией о проекте
  div(v-if="project")
    .row.items-center.q-gutter-md.q-pa-md
      q-icon(name='work', size='32px', color='primary')
      .col
        ProjectTitleEditor(
          :project='project'
          label='Проект'
          @field-change="handleFieldChange"
          @update:title="handleTitleUpdate"
        )

        ProjectControls(:project='project')

  // Индикатор авто-сохранения
  AutoSaveIndicator(
    :is-auto-saving="isAutoSaving"
    :auto-save-error="autoSaveError"
  ).q-ml-md

  Editor(
    :min-height="300",
    v-if="project"
    v-model='description',
    :placeholder='descriptionPlaceholder || "Введите описание..."',
    :readonly="!permissions?.can_edit_project || isProjectCompleted"
    @change='handleDescriptionChange'
  ).q-mb-xl
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { Editor, AutoSaveIndicator } from 'src/shared/ui';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';
import { ProjectControls, ProjectTitleEditor } from 'app/extensions/capital/widgets';
import { useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';
import { Zeus } from '@coopenomics/sdk';

defineProps<{
  descriptionPlaceholder?: string;
}>();

// Используем composable для редактирования проекта с авто-сохранением
const { debounceSave, saveImmediately, isAutoSaving, autoSaveError } = useEditProject();

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();

// Computed свойства для двухсторонней привязки
const description = computed({
  get: () => project.value?.description || '',
  set: (value: string) => {
    if (project.value) {
      project.value.description = value;
    }
  }
});

// Computed для разрешений
const permissions = computed((): IProjectPermissions | null => {
  return project.value?.permissions || null;
});

// Проверка, является ли проект завершенным (статус RESULT)
const isProjectCompleted = computed(() => {
  if (!project.value) return false;
  const status = String(project.value.status);
  return status === Zeus.ProjectStatus.RESULT || status === 'RESULT';
});

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

// Обработчик обновления названия проекта
const handleTitleUpdate = (value: string) => {
  if (project.value) {
    project.value.title = value;
  }
};

// Обработчик изменения описания проекта
const handleDescriptionChange = () => {
  if (!project.value || isProjectCompleted.value) return;

  const updateData = {
    project_hash: project.value.project_hash || '',
    title: project.value.title || '',
    description: project.value.description || '',
    invite: project.value.invite || '',
    coopname: (project.value as any).coopname || '',
    meta: '',
    data: '',
    can_convert_to_project: false,
  };

  // Запускаем авто-сохранение с задержкой
  debounceSave(updateData);
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

// Инициализация
onMounted(async () => {
  await loadProject();

  // Запускаем poll обновление данных
  startProjectPoll();
});

// Watcher для конвертации описания в EditorJS формат при загрузке
watch(project, (newProject) => {
  if (newProject?.description) {
    newProject.description = ensureEditorJSFormat(newProject.description);
  }
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(async () => {
  stopProjectPoll();

  // Сохраняем изменения немедленно при уходе со страницы
  if (project.value && !isAutoSaving.value && !isProjectCompleted.value) {
    try {
      const updateData = {
        project_hash: project.value.project_hash || '',
        title: project.value.title || '',
        description: project.value.description || '',
        invite: project.value.invite || '',
        coopname: (project.value as any).coopname || '',
        meta: '',
        data: '',
        can_convert_to_project: false,
      };

      await saveImmediately(updateData);
      console.log('Изменения сохранены при уходе со страницы');
    } catch (error) {
      console.error('Ошибка при сохранении изменений при уходе со страницы:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
</style>
