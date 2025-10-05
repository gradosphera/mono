<template lang="pug">
q-btn(
  color='primary',
  @click.stop='handleButtonClick',
  :loading='loading',
  :label='mini ? "" : "Компонент"',
  :icon='mini ? "add" : "add"',
  :size='mini ? "sm" : "md"',
  push,
  :dense="isMobile"
)

  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Создать компонент"')
      Form.q-pa-md(
        :handler-submit='handleCreateComponent',
        :is-submitting='isSubmitting',
        :button-submit-txt='"Создать"',
        :button-cancel-txt='"Отмена"',
        @cancel='clear'
      )
        q-input(
          outline
          v-model='formData.title',
          label='Название компонента',
          :rules='[(val) => notEmpty(val)]',
          autocomplete='off'
        )

        Editor(
          v-model='formData.description',
          label='Описание компонента',
          placeholder='Опишите компонент подробно...',
          style="border: 1px solid grey; padding: 5px;"
        )

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateComponent } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { Editor } from 'src/shared/ui';
import { useWindowSize } from 'src/shared/hooks';

const { isMobile } = useWindowSize();
const props = defineProps<{
  project: IProject;
  mini?: boolean;
}>();
const emit = defineEmits<{
  onClick: [];
}>();

const system = useSystemStore();
const { createComponent } = useCreateComponent();

const loading = ref(false);
const showDialog = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  title: '',
  description: '',
});

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения';
};

const clear = () => {
  showDialog.value = false;
  formData.value = {
    title: '',
    description: '',
  };
};

const handleButtonClick = () => {
  // Сначала отправляем событие для закрытия меню
  // Потом открываем диалог
  showDialog.value = true;
};

const handleCreateComponent = async () => {
  try {
    isSubmitting.value = true;

    const projectHash = await generateUniqueHash();

    const inputData = {
      coopname: system.info.coopname,
      project_hash: projectHash,
      parent_hash: props.project.project_hash,
      title: formData.value.title,
      description: formData.value.description,
      meta: JSON.stringify({}),
      can_convert_to_project: false,
      data: '',
      invite: '',
    };

    await createComponent(inputData);
    SuccessAlert('Компонент успешно создан');
    clear();
    // После успешного создания компонента отправляем событие для закрытия меню
    emit('onClick');
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
