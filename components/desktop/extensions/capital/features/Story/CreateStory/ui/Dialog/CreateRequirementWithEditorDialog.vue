<template lang="pug">
CreateDialog(
  maximized
  ref="dialogRef"
  title="Создать требование"
  submit-text="Создать"
  :is-submitting="isSubmitting"
  :disable-submit="!canCreate"
  @submit="handleSubmit"
  @dialog-closed="clear"
)
  template(#form-fields)
    q-input(
      ref='titleInput'
      autofocus
      type="textarea"
      rows=2
      v-model='formData.title',
      standout='bg-teal text-white',
      label='Заголовок требования',
      placeholder='Кратко сформулируйте требование',
      :rules='[(val) => notEmpty(val)]',
      autocomplete='off'
    ).q-mb-md

    .text-subtitle2.q-mb-sm Описание требования
    Editor(
      v-model='formData.description'
      placeholder='Опишите требование подробно в формате Markdown...'
      :minHeight="300"
    )
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { CreateDialog } from 'src/shared/ui/CreateDialog';
import { Editor } from 'src/shared/ui';
import { useCreateStory } from '../../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';

const props = defineProps<{
  filter?: {
    project_hash?: string;
    issue_id?: string;
  };
}>();

const emit = defineEmits<{
  success: [];
  error: [error: any];
}>();

const dialogRef = ref();
const titleInput = ref();
const system = useSystemStore();
const { createStory } = useCreateStory();

const isSubmitting = ref(false);

const formData = ref({
  title: '',
  description: '',
});

const canCreate = computed(() => {
  return formData.value.title.trim().length > 0;
});

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения';
};

const clearForm = async () => {
  formData.value = {
    title: '',
    description: '',
  };

  // Сбрасываем валидацию
  titleInput.value?.resetValidation();

  // Устанавливаем фокус на первое поле после очистки
  await nextTick();
  titleInput.value?.focus();
};

const clear = async () => {
  await clearForm();
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const inputData = {
      coopname: system.info.coopname,
      title: formData.value.title,
      description: formData.value.description,
      story_hash: '',
      ...props.filter, // Добавляем фильтр (project_hash или issue_id)
    };

    await createStory(inputData);

    SuccessAlert('Требование успешно создано');

    // Закрываем диалог после успешного создания
    dialogRef.value?.clear();
    emit('success');
  } catch (error) {
    FailAlert(error);
    emit('error', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog: () => dialogRef.value?.openDialog(),
  clear: () => dialogRef.value?.clear(),
});
</script>
