<template lang="pug">
q-btn(
  color='accent',
  @click.stop='showDialog = true',
  :loading='loading',
  label="Коммит",
  icon="add",
  :size='mini ? "sm" : "md"',
  :dense="isMobile"
  :disabled='disabled'
)

  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Создать коммит"')
      Form.q-pa-md(
        :handler-submit='handleCreateCommit',
        :is-submitting='isSubmitting',
        :button-submit-txt='"Создать"',
        :button-cancel-txt='"Отмена"',
        @cancel='clear'
      )
        q-input(
          v-model='formData.description',
          outline
          label='Описание коммита',
          :rules='[(val) => !!val || "Описание обязательно"]',
          autocomplete='off'
          placeholder='Опишите изменения...'
        )

        q-input.q-mt-md(
          v-model='formData.data',
          outline
          label='Ссылка на Git (опционально)',
          autocomplete='off'
          placeholder='https://github.com/owner/repo/pull/123'
          hint='Укажите ссылку на PR или коммит для автоматического извлечения diff'
        )
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCreateCommit } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { useWindowSize } from 'src/shared/hooks';

const { isMobile } = useWindowSize();
const props = defineProps<{
  mini?: boolean;
  projectHash?: string;
  uncommittedHours?: number;
  disabled?: boolean;
}>();

const system = useSystemStore();
const session = useSessionStore();
const { createCommit, createCommitInput } = useCreateCommit(props.projectHash, session.username);

const loading = ref(false);
const showDialog = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  creator_hours: 0,
  description: '',
  data: '',
});

// Устанавливаем часы при открытии диалога
watch(showDialog, (isOpen) => {
  if (isOpen) {
    formData.value.creator_hours = props.uncommittedHours || 0;
  }
});

const clear = () => {
  showDialog.value = false;
  formData.value = {
    creator_hours: props.uncommittedHours || 0,
    description: '',
    data: ''
  };
};

const handleCreateCommit = async () => {
  try {
    isSubmitting.value = true;

    // Создаем данные для коммита с учетом формы и контекста
    // commit_hash теперь генерируется на бэкенде, если указан data
    const commitData = {
      coopname: system.info.coopname,
      commit_hours: formData.value.creator_hours,
      project_hash: props.projectHash || createCommitInput.value.project_hash,
      username: session.username || createCommitInput.value.username,
      description: formData.value.description,
      data: formData.value.data || undefined, // Git URL (опционально)
      meta: JSON.stringify({}),
    };

    const result = await createCommit(commitData);

    // result теперь содержит полный объект коммита с обогащенными данными
    console.log('Созданный коммит:', result);

    SuccessAlert('Коммит успешно создан');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
