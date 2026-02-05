<template lang="pug">
q-dialog(v-model='showDialog', @hide='clear')
  ModalBase(:title='props.title')
    template(#title v-if='$slots.title')
      slot(name="title")
    Form.q-pa-md(
      :handler-submit='handleSubmit',
      :is-submitting='props.isSubmitting',
      :button-submit-txt='props.submitText',
      :button-cancel-txt='"Отмена"',
      :disabled='props.disabled',
      @cancel='clear'
      :style="props.dialogStyle"
    )
      slot(name="form-fields")
        // Default form fields slot
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ModalBase } from '../ModalBase';
import { Form } from '../Form';

const props = withDefaults(defineProps<{
  title?: string;
  submitText?: string;
  dialogStyle?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}>(), {
  title: '',
  isSubmitting: false,
  disabled: false,
});

const emit = defineEmits<{
  submit: [data: any];
  dialogClosed: [];
}>();

const showDialog = ref(false);

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
  emit('submit', formData);
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog,
  clear,
});
</script>
