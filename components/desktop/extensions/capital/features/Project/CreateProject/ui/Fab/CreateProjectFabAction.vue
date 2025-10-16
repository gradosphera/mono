<template lang="pug">
q-fab-action(
  icon="add"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Проект
  CreateProjectDialog(
    ref="dialogRef"
    @submit="handleCreateProject"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateProject } from '../../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { CreateProjectDialog } from '../Dialog';

const emit = defineEmits<{
  actionCompleted: [];
}>();

const { createProject } = useCreateProject();
const dialogRef = ref();

const handleCreateProject = async (formData: any) => {
  try {
    await createProject(formData);
    SuccessAlert('Проект успешно создан');
    emit('actionCompleted');
  } catch (error) {
    FailAlert(error);
  }
};
</script>
