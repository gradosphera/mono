<template lang="pug">
q-btn(
  color='primary',
  @click.stop='showDialog = true',
  :loading='loading',
  label="Коммит",
  icon="add",
  :size='mini ? "sm" : "md"',
  :dense="isMobile"
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCreateCommit } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { useCurrentUser } from 'src/entities/Session/composables/useCurrentUser';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { useWindowSize } from 'src/shared/hooks';

const { isMobile } = useWindowSize();
const props = defineProps<{
  mini?: boolean;
  projectHash?: string;
  uncommittedHours?: number;
}>();

const system = useSystemStore();
const { username } = useCurrentUser();
const { createCommit, createCommitInput } = useCreateCommit(props.projectHash, username);

const loading = ref(false);
const showDialog = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  creator_hours: 0,
  description: '',
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
  };
};

const handleCreateCommit = async () => {
  try {
    isSubmitting.value = true;

    const commitHash = await generateUniqueHash();

    // Создаем данные для коммита с учетом формы и контекста
    const commitData = {
      commit_hash: commitHash,
      coopname: system.info.coopname,
      commit_hours: formData.value.creator_hours,
      project_hash: props.projectHash || createCommitInput.value.project_hash,
      username: username || createCommitInput.value.username,
      description: formData.value.description,
      meta: JSON.stringify({}),
    };

    await createCommit(commitData);
    SuccessAlert('Коммит успешно создан');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
