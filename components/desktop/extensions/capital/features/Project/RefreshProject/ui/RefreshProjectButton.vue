<template lang="pug">
q-btn(
  color='primary',
  @click='handleRefreshProject',
  :loading='loading',
  label='Обновить CRPS пайщика в проекте'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRefreshProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { refreshProject, refreshProjectInput } = useRefreshProject();
const loading = ref(false);

const handleRefreshProject = async () => {
  loading.value = true;
  try {
    await refreshProject(refreshProjectInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
