<template lang="pug">
q-btn(
  color='primary',
  @click='handleStartProject',
  :loading='loading',
  label='Запустить проект'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStartProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { startProject, startProjectInput } = useStartProject();
const loading = ref(false);

const handleStartProject = async () => {
  loading.value = true;
  try {
    await startProject(startProjectInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
