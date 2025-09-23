<template lang="pug">
q-btn(
  color='primary',
  @click='showDialog = true',
  :loading='loading',
  :label='mini ? "" : "Создать задачу"',
  :icon='mini ? "add" : "add"',
  :size='mini ? "sm" : "md"',
  :outline='mini'
  @click.stop
)

q-dialog(v-model='showDialog', @hide='clear')
  ModalBase(:title='"Создать задачу"')
    Form.q-pa-md(
      :handler-submit='handleCreateIssue',
      :is-submitting='isSubmitting',
      :button-submit-txt='"Создать"',
      :button-cancel-txt='"Отмена"',
      @cancel='clear'
    )
      q-input(
        autofocus
        v-model='formData.title',
        standout='bg-teal text-white',
        label='Название задачи',
        :rules='[(val) => notEmpty(val)]',
        autocomplete='off'
      )

      q-input(
        standout='bg-teal text-white',
        v-model='textDescription',
        label='Описание задачи',
        placeholder='Опишите задачу подробно...',
        type="textarea"
        rows=3
        @input='convertToEditorFormat'
      )

      // Скрытый Editor для конвертации текста в EditorJS формат
      div(style='display: none')
        Editor(
          ref='hiddenEditor',
          v-model='formData.description',
          @ready='onEditorReady'
        )

      q-select(
        v-model='formData.priority',
        standout='bg-teal text-white',
        label='Приоритет',
        :options='priorityOptions',
        option-value='value',
        option-label='label',
        emit-value,
        map-options
      )

      q-select(
        v-model='formData.status',
        standout='bg-teal text-white',
        label='Статус',
        :options='statusOptions',
        option-value='value',
        option-label='label',
        emit-value,
        map-options
      )

      q-input(
        v-model.number='formData.estimate',
        standout='bg-teal text-white',
        label='Оценка (часы)',
        type='number',
        :rules='[(val) => val >= 0 || "Оценка не может быть отрицательной"]',
        autocomplete='off'
      )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  mini?: boolean;
  projectHash?: string;
}>();
import { type ICreateIssueInput, useCreateIssue } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { useRoute } from 'vue-router';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { Editor } from 'src/shared/ui';
import { Zeus } from '@coopenomics/sdk';
import { useSessionStore } from 'src/entities/Session';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';

const route = useRoute();
const system = useSystemStore();
const { createIssue } = useCreateIssue();
const session = useSessionStore();
const loading = ref(false);
const showDialog = ref(false);
const isSubmitting = ref(false);

// Для работы с текстовым описанием и конвертацией в EditorJS
const textDescription = ref('');
const hiddenEditor = ref();

// Получаем project_hash из пропса или маршрута
const currentProjectHash = computed(() => props.projectHash || (route.params.project_hash as string));

const formData = ref({
  title: '',
  description: '',
  priority: Zeus.IssuePriority.MEDIUM,
  status: Zeus.IssueStatus.BACKLOG,
  estimate: 0,
  labels: [] as string[],
  attachments: [] as string[],
});

const priorityOptions = [
  { value: Zeus.IssuePriority.LOW, label: 'Низкий' },
  { value: Zeus.IssuePriority.MEDIUM, label: 'Средний' },
  { value: Zeus.IssuePriority.HIGH, label: 'Высокий' },
  { value: Zeus.IssuePriority.URGENT, label: 'Срочный' },
];

const statusOptions = [
  { value: Zeus.IssueStatus.BACKLOG, label: 'Бэклог' },
  { value: Zeus.IssueStatus.TODO, label: 'К выполнению' },
  { value: Zeus.IssueStatus.IN_PROGRESS, label: 'В работе' },
  { value: Zeus.IssueStatus.DONE, label: 'Выполнена' },
  { value: Zeus.IssueStatus.CANCELED, label: 'Отменена' },
];

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

const clear = () => {
  showDialog.value = false;
  textDescription.value = '';
  formData.value = {
    title: '',
    description: '',
    priority: Zeus.IssuePriority.MEDIUM,
    status: Zeus.IssueStatus.BACKLOG,
    estimate: 0,
    labels: [],
    attachments: [],
  };
};

// Валидация для описания (проверяем что текстовое поле не пустое)
const validateDescription = (val: string) => {
  if (!val || val.trim() === '') {
    return 'Описание задачи обязательно для заполнения';
  }
  return true;
};


const handleCreateIssue = async () => {
  try {
    // Финальная конвертация текста в EditorJS формат перед отправкой
    await convertToEditorFormat();

    // Валидация перед отправкой
    const descriptionError = validateDescription(textDescription.value);
    if (descriptionError !== true) {
      FailAlert(descriptionError);
      return;
    }

    isSubmitting.value = true;
    const issueHash = await generateUniqueHash();

    const inputData: ICreateIssueInput = {
      issue_hash: issueHash,
      coopname: system.info.coopname,
      created_by: session.username,
      project_hash: currentProjectHash.value,
      title: formData.value.title,
      description: formData.value.description,
      priority: formData.value.priority,
      status: formData.value.status,
      estimate: formData.value.estimate,
      labels: formData.value.labels,
      attachments: formData.value.attachments,
    };

    await createIssue(inputData);
    SuccessAlert('Задача успешно создана');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
