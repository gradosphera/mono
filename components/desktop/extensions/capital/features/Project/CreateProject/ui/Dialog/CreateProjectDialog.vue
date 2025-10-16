<template lang="pug">
CreateDialog(
  ref="dialogRef"
  title="Создать проект"
  submit-text="Создать"
  dialog-style="width: 600px; max-width: 100% !important;"
  @submit="handleSubmit"
  @dialog-closed="clear"
)
  template(#form-fields)
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
import { useSystemStore } from 'src/entities/System/model';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { CreateDialog } from 'src/shared/ui/CreateDialog';
import { Editor } from 'src/shared/ui';

const emit = defineEmits<{
  submit: [data: any];
}>();

const dialogRef = ref();
const system = useSystemStore();

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

const handleSubmit = async () => {
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

  emit('submit', inputData);
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog: () => dialogRef.value?.openDialog(),
  clear: () => dialogRef.value?.clear(),
});
</script>
