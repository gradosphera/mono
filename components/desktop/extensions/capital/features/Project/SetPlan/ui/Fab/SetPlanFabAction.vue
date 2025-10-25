<template lang="pug">
q-fab-action(
  icon="edit"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Финплан
  SetPlanDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SetPlanDialog } from '../Dialog';
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
