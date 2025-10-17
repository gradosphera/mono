<template lang="pug">
q-fab-action(
  icon="add"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Проект
  CreateProjectDialog(
    ref="dialogRef"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateProjectDialog } from '../Dialog';

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
