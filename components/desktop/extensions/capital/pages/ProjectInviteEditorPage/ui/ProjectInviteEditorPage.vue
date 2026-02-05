<template lang="pug">
div(style="padding-bottom: 100px;")

  // Индикатор авто-сохранения
  AutoSaveIndicator(
    :is-auto-saving="isAutoSaving"
    :auto-save-error="autoSaveError"
  ).q-ml-md

  // Редактор приглашения
  Editor(
    :min-height="300",
    v-if="project"
    v-model='invite',
    :placeholder='invitePlaceholder || "Введите приглашение..."',
    :readonly="!permissions?.can_edit_project"
    @change='handleInviteChange'
  ).q-mb-xl
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { Editor, AutoSaveIndicator } from 'src/shared/ui';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';
import { toMarkdown } from 'src/shared/lib/utils';

defineProps<{
  invitePlaceholder?: string;
}>();

// Используем composable для редактирования проекта с авто-сохранением
const { debounceSave, saveImmediately, isAutoSaving, autoSaveError } = useEditProject();

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();

// Оригинальное состояние приглашения для отслеживания изменений
const originalInvite = ref('');

// Computed свойства для двухсторонней привязки
const invite = computed({
  get: () => project.value?.invite || '',
  set: (value: string) => {
    if (project.value) {
      project.value.invite = value;
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
  return invite.value !== originalInvite.value;
});

// Проверяем и конвертируем приглашение в Markdown формат если необходимо
const ensureMarkdownFormat = (invite: any) => {
  if (!invite) return '';

  // Используем универсальную утилиту конвертации
  return toMarkdown(invite);
};

// Обработчик изменения приглашения
const handleInviteChange = () => {
  if (!project.value || !permissions.value?.can_edit_project) return;

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

// Watcher для конвертации приглашения в Markdown формат при загрузке и инициализации оригинального состояния
watch(project, (newProject) => {
  if (newProject?.invite) {
    newProject.invite = ensureMarkdownFormat(newProject.invite);
    // Инициализируем оригинальное состояние для отслеживания изменений
    originalInvite.value = newProject.invite;
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
});

// Сохраняем изменения немедленно при уходе со страницы только если есть изменения и права
onBeforeUnmount(async () => {
  if (project.value && !isAutoSaving.value && hasChanges.value && permissions.value?.can_edit_project) {
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
      console.log('Изменения сохранены при уходе со страницы приглашения проекта');
    } catch (error) {
      console.error('Ошибка при сохранении изменений при уходе со страницы приглашения проекта:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
</style>
