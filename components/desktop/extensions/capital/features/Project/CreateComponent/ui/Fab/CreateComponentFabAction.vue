<template lang="pug">
q-fab-action(
  icon="add"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Компонент
  CreateComponentDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateComponentDialog } from '../Dialog';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

defineProps<{
  project: IProject;
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
