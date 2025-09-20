<template lang="pug">
q-btn(
  color='primary',
  @click='showDialog = true',
  :loading='loading',
  :label='mini ? "" : "Создать коммит"',
  :icon='mini ? "add" : "add"',
  :size='mini ? "sm" : "md"',
  :outline='mini'
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
        v-model.number='formData.creator_hours',
        outline
        type='number'
        label='Часы работы',
        :rules='[(val) => val >= 0 || "Часы должны быть больше или равны 0"]',
        autocomplete='off'
        placeholder='0'
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
import { ref } from 'vue';
import { useCreateCommit } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { useCurrentUser } from 'src/entities/Session/composables/useCurrentUser';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';

const props = defineProps<{
  mini?: boolean;
  projectHash?: string;
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

const clear = () => {
  showDialog.value = false;
  formData.value = {
    creator_hours: 0,
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
      creator_hours: formData.value.creator_hours,
      project_hash: props.projectHash || createCommitInput.value.project_hash,
      username: username || createCommitInput.value.username,
      description: formData.value.description,
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
