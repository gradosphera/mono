<template lang="pug">
q-dialog(v-model='showDialog', @hide='clear')
  ModalBase(:title='title')
    Form.q-pa-md(
      :handler-submit='handleSubmit',
      :is-submitting='isSubmitting',
      :button-submit-txt='submitText',
      :button-cancel-txt='"Отмена"',
      @cancel='clear'
      :style="dialogStyle"
    )
      slot(name="form-fields")
        // Default form fields slot
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FailAlert } from 'src/shared/api/alerts';
import { ModalBase } from '../ModalBase';
import { Form } from '../Form';

defineProps<{
  title: string;
  submitText?: string;
  dialogStyle?: string;
}>();

const emit = defineEmits<{
  submit: [data: any];
  dialogClosed: [];
}>();

const showDialog = ref(false);
const isSubmitting = ref(false);

// Функция для открытия диалога
const openDialog = () => {
  showDialog.value = true;
};

// Функция для закрытия диалога
const clear = () => {
  showDialog.value = false;
  emit('dialogClosed');
};

// Функция для обработки отправки формы
const handleSubmit = async (formData: any) => {
  try {
    isSubmitting.value = true;
    emit('submit', formData);
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog,
  clear,
});
</script>
