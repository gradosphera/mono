<template lang="pug">
q-btn(
  color='primary',
  @click='dialogRef?.openDialog()',
  :loading='loading',
  :label='mini ? "" : "Создать задачу"',
  :icon='mini ? "add" : "add"',
  :size='mini ? "sm" : "md"',
  flat,

  @click.stop
)

  CreateIssueDialog(
    ref='dialogRef',
    :project-hash='projectHash',
    @success='handleSuccess'
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateIssueDialog } from './Dialog';

defineProps<{
  mini?: boolean;
  projectHash?: string;
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();
const loading = ref(false);

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
