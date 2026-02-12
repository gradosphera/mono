<template lang="pug">
div
  q-input(
    v-if="project"
    v-model='title'
    :label='label || "Проект"'
    :readonly="!permissions?.can_edit_project"
    @input="handleFieldChange"
    filled
    type="textarea"
    autogrow
    :rules="[val => !!val || 'Название проекта обязательно']"
  ).full-width
    template(#prepend)
      // Показываем иконку отмены при наличии изменений, иначе - слот с иконкой
      q-btn(
        v-if="hasChanges && project?.permissions?.can_edit_project"
        flat
        round
        dense
        color="negative"
        icon="undo"
        size="sm"
        @click="resetChanges"
      )
        q-tooltip Отменить изменения
      slot(v-else name="prepend-icon")
        q-icon(name='work', size='24px', color='primary')

    template(#append)
      // Кнопки сохранения (если есть изменения)
      div(v-if="hasChanges && project?.permissions?.can_edit_project").row.q-gutter-xs.items-center
        q-btn(
          round
          dense
          color="primary"
          icon="save"
          size="sm"
          :loading="isSaving"
          @click="saveChanges"
        )
          q-tooltip Сохранить изменения
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import type { IProject, IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';

const props = defineProps<{
  project: IProject | null | undefined;
  label?: string;
}>();

const emit = defineEmits<{
  fieldChange: [];
  'update:title': [value: string];
}>();

const { saveImmediately } = useEditProject();

// Состояние
const originalProject = ref<IProject | null>(null);
const isSaving = ref(false);
const localTitle = ref('');

// Вычисляемое свойство для определения наличия изменений
const hasChanges = computed(() => {
  if (!originalProject.value) return false;
  return localTitle.value !== originalProject.value.title;
});

// Computed свойства для двухсторонней привязки
const title = computed({
  get: () => localTitle.value,
  set: (value: string) => {
    localTitle.value = value;
    emit('update:title', value);
  }
});

// Computed для разрешений
const permissions = computed((): IProjectPermissions | null => {
  return props.project?.permissions || null;
});

// Обработчик изменения полей
const handleFieldChange = () => {
  emit('fieldChange');
};

// Сохранение изменений
const saveChanges = async () => {
  if (!props.project || !permissions.value?.can_edit_project) return;

  try {
    isSaving.value = true;

    const updateData = {
      project_hash: props.project.project_hash || '',
      title: props.project.title || '',
      description: props.project.description || '',
      invite: props.project.invite || '',
      coopname: (props.project as any).coopname || '',
      meta: '',
      data: '',
    };

    await saveImmediately(updateData);

    // Обновляем оригинальное состояние после успешного сохранения
    if (props.project) {
      originalProject.value = JSON.parse(JSON.stringify(props.project));
    }

    SuccessAlert('Название проекта сохранено успешно');
  } catch (error) {
    console.error('Ошибка при сохранении названия проекта:', error);
    FailAlert('Не удалось сохранить название проекта');
  } finally {
    isSaving.value = false;
  }
};

// Сброс изменений
const resetChanges = () => {
  if (!originalProject.value) return;

  // Восстанавливаем оригинальные значения
  localTitle.value = originalProject.value.title;
  emit('update:title', originalProject.value.title);
};

// Watcher для отслеживания изменений project
watch(() => props.project, (newProject) => {
  if (newProject && !originalProject.value) {
    // Инициализируем оригинальное состояние при первой загрузке
    originalProject.value = JSON.parse(JSON.stringify(newProject));
    localTitle.value = newProject.title || '';
  }
}, { immediate: true, deep: true });
</script>

<style lang="scss" scoped>
</style>
