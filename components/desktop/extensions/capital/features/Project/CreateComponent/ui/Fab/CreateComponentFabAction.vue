<template lang="pug">
q-fab-action(
  icon="add"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Компонент
  CreateComponentDialog(
    ref="dialogRef"
    :project="project"
    @submit="handleCreateComponent"
    @on-click="handleActionClick"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateComponent } from '../../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { CreateComponentDialog } from '../Dialog';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

defineProps<{
  project: IProject;
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const { createComponent } = useCreateComponent();
const dialogRef = ref();

const handleCreateComponent = async (formData: any) => {
  try {
    await createComponent(formData);
    SuccessAlert('Компонент успешно создан');
    emit('actionCompleted');
  } catch (error) {
    FailAlert(error);
  }
};

const handleActionClick = () => {
  // Закрываем меню при клике на действие
  emit('actionCompleted');
};
</script>
