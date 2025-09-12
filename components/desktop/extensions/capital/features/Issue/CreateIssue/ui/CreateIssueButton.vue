<template lang="pug">
q-btn(
  color='primary',
  @click='handleCreateIssue',
  :loading='loading',
  label='Создать задачу'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateIssue } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { createIssue, createIssueInput } = useCreateIssue();
const loading = ref(false);

const handleCreateIssue = async () => {
  loading.value = true;
  try {
    await createIssue(createIssueInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
