<template lang="pug">
div
  Editor(
    :min-height="300",
    v-if="project"
    v-model='description',
    :placeholder='descriptionPlaceholder || "Введите описание..."',
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
import { useRoute } from 'vue-router';
import type { IProject, IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { Editor } from 'src/shared/ui';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';

defineProps<{
  descriptionPlaceholder?: string;
}>();

const route = useRoute();
const projectStore = useProjectStore();
const { saveImmediately } = useEditProject();

// Состояние проекта
const project = ref<IProject | null | undefined>(null);
const originalProject = ref<IProject | null>(null);
const isSaving = ref(false);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

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

// Загрузка проекта из store (родитель уже должен загрузить)
const loadProject = async () => {
  // Ищем проект в store
  const foundProject = projectStore.projects.items.find(p => p.project_hash === projectHash.value);
  if (foundProject) {
    project.value = foundProject;
    // Сохраняем оригинальное состояние для отслеживания изменений
    originalProject.value = JSON.parse(JSON.stringify(foundProject));
  } else {
    // Если проект не найден в store, пробуем загрузить
    try {
      await projectStore.loadProject({
        hash: projectHash.value,
      });
    } catch (error) {
      console.error('Ошибка при загрузке проекта:', error);
      FailAlert('Не удалось загрузить проект');
    }
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
    project.value.description = originalProject.value.description;
  }
};

// Watcher для синхронизации локального состояния с store
watch(() => projectStore.projects.items, (newItems) => {
  if (newItems && projectHash.value) {
    const foundProject = newItems.find(p => p.project_hash === projectHash.value);
    if (foundProject) {
      project.value = foundProject;
      // Обновляем оригинальное состояние только если нет несохраненных изменений
      if (!hasChanges.value) {
        originalProject.value = JSON.parse(JSON.stringify(foundProject));
      }
    }
  }
});

// Watcher для изменения projectHash
watch(projectHash, async (newHash, oldHash) => {
  if (newHash && newHash !== oldHash) {
    await loadProject();
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
</style>
