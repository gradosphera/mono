<template lang="pug">
q-btn(
  color='primary',
  @click='handleCreateProjectInvest',
  :loading='loading',
  label='Инвестировать в проект'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateProjectInvest } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { createProjectInvest, createProjectInvestInput } =
  useCreateProjectInvest();
const loading = ref(false);

const handleCreateProjectInvest = async () => {
  loading.value = true;
  try {
    await createProjectInvest(createProjectInvestInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
