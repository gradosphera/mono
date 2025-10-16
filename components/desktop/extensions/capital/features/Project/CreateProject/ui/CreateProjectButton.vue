<template lang="pug">
q-fab-action(color="primary" @click="showDialog = true" icon="add") Проект
  //- q-btn(
  //-   color='primary',
  //-   @click='showDialog = true',
  //-   :loading='loading',
  //-   label="Проект",
  //-   icon="add",
  //-   :dense="isMobile"
  //- )
  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Создать проект"')
      Form.q-pa-md(
        :handler-submit='handleCreateProject',
        :is-submitting='isSubmitting',
        :button-submit-txt='"Создать"',
        :button-cancel-txt='"Отмена"',
        @cancel='clear'
        style="width: 600px; max-width: 100% !important;"
      )
        q-input(
          v-model='formData.title',
          outline
          label='Название проекта',
          :rules='[(val) => notEmpty(val)]',
          autocomplete='off'
        )

        Editor(
          v-model='formData.description',
          label='Описание проекта',
          placeholder='Опишите проект...',
          autocomplete='off',
          :minHeight='200'
        )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateProject } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { Editor } from 'src/shared/ui';

defineProps<{
  mini?: boolean;
}>();

const system = useSystemStore();
const { createProject } = useCreateProject();

const showDialog = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  parent_hash: '',
  title: '',
  description: '',
  data: '',
  invite: '',
  meta: JSON.stringify({}),
  can_convert_to_project: false,
});

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения';
};

const clear = () => {
  showDialog.value = false;
  formData.value = {
    parent_hash: '',
    title: '',
    description: '',
    meta: '',
    data: '',
    invite: '',
    can_convert_to_project: false,
  };
};

const handleCreateProject = async () => {
  try {
    isSubmitting.value = true;

    const projectHash = await generateUniqueHash();

    const inputData = {
      coopname: system.info.coopname,
      project_hash: projectHash,
      parent_hash: formData.value.parent_hash || '',
      title: formData.value.title,
      description: formData.value.description,
      meta: formData.value.meta,
      can_convert_to_project: formData.value.can_convert_to_project,
      data: formData.value.data,
      invite: formData.value.invite,
    };

    await createProject(inputData);
    SuccessAlert('Проект успешно создан');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
