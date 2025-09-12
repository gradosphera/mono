<template lang="pug">
q-btn(
  color='primary',
  @click='handleOpenProject',
  :loading='loading',
  label='Открыть проект для инвестиций'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOpenProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { openProject, openProjectInput } = useOpenProject();
const loading = ref(false);

const handleOpenProject = async () => {
  loading.value = true;
  try {
    await openProject(openProjectInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
