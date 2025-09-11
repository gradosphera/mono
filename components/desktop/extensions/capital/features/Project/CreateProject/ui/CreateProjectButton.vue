<template lang="pug">
q-btn(
  color='primary',
  @click='handleCreateProject',
  :loading='loading',
  label='Создать проект'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { createProject, createProjectInput } = useCreateProject();
const loading = ref(false);

const handleCreateProject = async () => {
  loading.value = true;
  try {
    await createProject(createProjectInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
