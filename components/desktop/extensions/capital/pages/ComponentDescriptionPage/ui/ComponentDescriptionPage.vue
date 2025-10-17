<template lang="pug">
div(style="padding-bottom: 100px;")
  Editor(
    :min-height="300",
    v-if="project"
    v-model='description',
    :placeholder='descriptionPlaceholder || "Введите описание компонента..."',
    :readonly="!permissions?.can_edit_project"
  ).q-mb-xl

  DescriptionSaveButtons(
    :has-changes="hasChanges"
    :can-edit="!!permissions?.can_edit_project"
    :is-saving="isSaving"
    @reset="resetChanges"
    @save="saveChanges"
  )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import type { IProject, IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { Editor, DescriptionSaveButtons } from 'src/shared/ui';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';

defineProps<{
  descriptionPlaceholder?: string;
}>();

const { saveImmediately } = useEditProject();

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();
const originalProject = ref<IProject | null>(null);
const isSaving = ref(false);

// Вычисляемое свойство для определения наличия изменений
const hasChanges = computed(() => {
  if (!project.value || !originalProject.value) return false;
  return project.value.description !== originalProject.value.description;
});

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

// Синхронизация оригинального состояния проекта
const syncOriginalProject = () => {
  if (project.value) {
    originalProject.value = JSON.parse(JSON.stringify(project.value));
  }
};

// Сохранение изменений
const saveChanges = async () => {
  if (!project.value) return;

  try {
    isSaving.value = true;

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

    // Обновляем оригинальное состояние после успешного сохранения
    originalProject.value = JSON.parse(JSON.stringify(project.value));

    SuccessAlert('Изменения сохранены успешно');
  } catch (error) {
    console.error('Ошибка при сохранении компонента:', error);
    FailAlert('Не удалось сохранить изменения');
  } finally {
    isSaving.value = false;
  }
};

// Сброс изменений
const resetChanges = () => {
  if (!originalProject.value) return;

  // Восстанавливаем оригинальные значения
  if (project.value) {
    project.value.description = originalProject.value.description;
  }
};

// Watcher для синхронизации оригинального состояния проекта
watch(project, (newProject) => {
  if (newProject && !originalProject.value) {
    // Инициализируем оригинальное состояние при первой загрузке
    syncOriginalProject();
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
</style>
