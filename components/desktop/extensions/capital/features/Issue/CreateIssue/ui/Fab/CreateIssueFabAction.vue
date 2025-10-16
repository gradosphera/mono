<template lang="pug">
q-fab-action(
  icon="add"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Задача
  CreateIssueDialog(
    ref="dialogRef"
    :project-hash="projectHash"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateIssueDialog } from '../Dialog';

defineProps<{
  projectHash?: string;
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
