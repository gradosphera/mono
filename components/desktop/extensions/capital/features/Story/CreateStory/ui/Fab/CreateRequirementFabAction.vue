<template lang="pug">
q-fab-action(
  icon="assignment"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Требование
  CreateRequirementDialog(
    ref="dialogRef"
    :filter="filter"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateRequirementDialog } from '../Dialog'

defineProps<{
  filter?: {
    project_hash?: string;
    issue_id?: string;
  };
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
