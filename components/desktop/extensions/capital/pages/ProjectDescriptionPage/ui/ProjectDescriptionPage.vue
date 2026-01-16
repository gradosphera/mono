<template lang="pug">
div.q-pa-md
  // Индикатор авто-сохранения
  AutoSaveIndicator(
    :is-auto-saving="isAutoSaving"
    :auto-save-error="autoSaveError"
  )

  Editor(
    :min-height="300",
    v-if="project"
    v-model='description',
    :placeholder='descriptionPlaceholder || "Введите описание..."',
    :readonly="!permissions?.can_edit_project || isProjectCompleted"
    @change='handleDescriptionChange'
  )
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { Editor, AutoSaveIndicator } from 'src/shared/ui';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';
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

// Оригинальное состояние описания для отслеживания изменений
const originalDescription = ref('');

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

// Computed для проверки наличия изменений
const hasChanges = computed(() => {
  if (!project.value) return false;
  return description.value !== originalDescription.value;
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

// Обработчик изменения описания проекта
const handleDescriptionChange = () => {
  if (!project.value || isProjectCompleted.value || !permissions.value?.can_edit_project) return;

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

  // Запускаем авто-сохранение с задержкой только при наличии прав
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

// Watcher для конвертации описания в EditorJS формат при загрузке и инициализации оригинального состояния
watch(project, (newProject) => {
  if (newProject?.description) {
    newProject.description = ensureEditorJSFormat(newProject.description);
    // Инициализируем оригинальное состояние для отслеживания изменений
    originalDescription.value = newProject.description;
  }
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(async () => {
  stopProjectPoll();

  // Сохраняем изменения немедленно при уходе со страницы только если есть изменения и права
  if (project.value && !isAutoSaving.value && !isProjectCompleted.value && hasChanges.value && permissions.value?.can_edit_project) {
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
