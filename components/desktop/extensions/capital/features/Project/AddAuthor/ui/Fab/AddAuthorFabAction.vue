<template lang="pug">
q-fab-action(
  icon="person_add"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Соавторы
  AddAuthorDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AddAuthorDialog } from '../Dialog';
import type { IProject } from '../../../../../entities/Project/model';

defineProps<{ project: IProject | null | undefined }>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
