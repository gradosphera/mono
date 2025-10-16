<template lang="pug">
CreateDialog(
  ref="dialogRef"
  title="Создать компонент"
  submit-text="Создать"
  @submit="handleSubmit"
  @dialog-closed="clear"
)
  template(#form-fields)
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
import { useSystemStore } from 'src/entities/System/model';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { CreateDialog } from 'src/shared/ui/CreateDialog';
import { Editor } from 'src/shared/ui';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

const props = defineProps<{
  project: IProject;
}>();

const emit = defineEmits<{
  submit: [data: any];
  onClick: [];
}>();

const dialogRef = ref();
const system = useSystemStore();

const formData = ref({
  title: '',
  description: '',
});

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения';
};

const clear = () => {
  formData.value = {
    title: '',
    description: '',
  };
};

const handleSubmit = async () => {
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

  emit('submit', inputData);
  emit('onClick');
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog: () => dialogRef.value?.openDialog(),
  clear: () => dialogRef.value?.clear(),
});
</script>
