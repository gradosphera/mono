<template lang="pug">
div
  // Заголовок страницы
  h4.q-mb-md Редактирование приглашения в проект

  // Редактор приглашения
  Editor(
    :min-height="300",
    v-if="project"
    v-model='invite',
    :placeholder='invitePlaceholder || "Введите приглашение..."',
    :readonly="!permissions?.can_edit_project"
  )

  // Кнопки сохранения (если есть изменения)
  div(v-if="hasChanges && project?.permissions?.can_edit_project").row.justify-end.q-gutter-sm.q-mt-md
    q-btn(
      flat
      color="negative"
      label="Отменить изменения"
      @click="resetChanges"
    )
    q-btn(
      color="primary"
      label="Сохранить"
      :loading="isSaving"
      @click="saveChanges"
    )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import type { IProject, IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { Editor } from 'src/shared/ui';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';

defineProps<{
  invitePlaceholder?: string;
}>();

const { saveImmediately } = useEditProject();

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();
const originalProject = ref<IProject | null>(null);
const isSaving = ref(false);

// Вычисляемое свойство для определения наличия изменений
const hasChanges = computed(() => {
  if (!project.value || !originalProject.value) return false;
  return project.value.invite !== originalProject.value.invite;
});

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
    console.error('Ошибка при сохранении проекта:', error);
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
    project.value.invite = originalProject.value.invite;
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
