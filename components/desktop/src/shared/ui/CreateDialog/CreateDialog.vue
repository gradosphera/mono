<template lang="pug">
q-dialog(v-model='showDialog', @hide='clear', @show='onDialogShow')
  ModalBase(:title='props.title')
    template(#title v-if='$slots.title')
      slot(name="title")
    Form.q-pa-md(
      ref='formWrapperRef'
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
import { ref, nextTick, type ComponentPublicInstance } from 'vue';
import { ModalBase } from '../ModalBase';
import { Form } from '../Form';

/** Поля формы в слоте идут в разметке раньше кнопок Form — берём первый подходящий для ввода элемент. */
const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([disabled]), ' +
  'textarea:not([disabled]), ' +
  '[contenteditable="true"]:not([contenteditable="false"])';

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
const formWrapperRef = ref<ComponentPublicInstance | null>(null);

function focusFirstFieldInForm(): void {
  const root = formWrapperRef.value?.$el as HTMLElement | undefined;
  if (!root?.querySelector) {
    return;
  }
  const el = root.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null;
  el?.focus?.();
}

function onDialogShow(): void {
  nextTick(() => {
    focusFirstFieldInForm();
    // У q-field нативный input может появиться после первого тика отрисовки
    nextTick(() => {
      const root = formWrapperRef.value?.$el as HTMLElement | undefined;
      if (root?.contains(document.activeElement)) {
        return;
      }
      focusFirstFieldInForm();
    });
  });
}

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
