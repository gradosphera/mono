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

    //- q-input(
    //-   standout='bg-teal text-white',
    //-   v-model='textDescription',
    //-   label='Описание требования',
    //-   placeholder='Опишите требование...',
    //-   type="textarea"
    //-   rows=2
    //-   @input='convertToEditorFormat'
    //- )

    // Скрытый Editor для конвертации текста в EditorJS формат
    div(style='display: none')
      Editor(
        ref='hiddenEditor',
        v-model='formData.description',
        @ready='onEditorReady'
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
import { Editor } from 'src/shared/ui';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';
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

// Для работы с текстовым описанием и конвертацией в EditorJS
const textDescription = ref('');
const hiddenEditor = ref();
const createAnother = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  title: '',
  description: '',
});

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения';
};

// Конвертация текста в EditorJS формат
const convertToEditorFormat = async () => {
  if (hiddenEditor.value) {
    try {
      // Создаем EditorJS данные из текста
      const editorJSData = textToEditorJS(textDescription.value);
      formData.value.description = editorJSData;
    } catch (error) {
      console.error('Error converting text to EditorJS:', error);
    }
  }
};

// Обработчик готовности скрытого редактора
const onEditorReady = () => {
  // Инициализируем конвертацию при готовности редактора
  convertToEditorFormat();
};

const clearForm = async () => {
  textDescription.value = '';
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
    // Финальная конвертация текста в EditorJS формат перед отправкой
    await convertToEditorFormat();

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
