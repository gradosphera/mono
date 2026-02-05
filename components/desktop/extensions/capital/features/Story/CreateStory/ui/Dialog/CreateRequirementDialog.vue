<template lang="pug">
CreateDialog(
  ref="dialogRef"
  title="Создать требование"
  submit-text="Создать"
  dialog-style="width: 500px; max-width: 100% !important;"
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
      rows=3
      v-model='formData.title',
      standout='bg-teal text-white',
      label='Кратко сформулируйте требование',
      :rules='[(val) => notEmpty(val)]',
      autocomplete='off'
      @keydown.enter.prevent='handleSubmit'
    )


    q-checkbox(
      v-model='createAnother',
      label='Создать еще одно требование'
    )
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { CreateDialog } from 'src/shared/ui/CreateDialog';
import { useCreateStory } from '../../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';

const props = defineProps<{
  filter?: {
    project_hash?: string;
    issue_id?: string;
  };
  canCreate?: boolean;
}>();

const canCreate = computed(() => props.canCreate ?? true);

const emit = defineEmits<{
  success: [];
  error: [error: any];
}>();

const dialogRef = ref();
const titleInput = ref();
const system = useSystemStore();
const { createStory } = useCreateStory();

const createAnother = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  title: '',
  description: '',
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
  createAnother.value = false;
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

    if (createAnother.value) {
      // Очищаем форму для создания следующего требования
      clearForm();
      // Диалог остается открытым
    } else {
      // Закрываем диалог после успешного создания
      dialogRef.value?.clear();
      emit('success');
    }
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
