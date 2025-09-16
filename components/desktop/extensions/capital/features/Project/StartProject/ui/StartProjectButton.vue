<template lang="pug">
q-btn(
  color='primary',
  @click='handleStartProject',
  :loading='loading',
  label='Запустить проект'
)
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStartProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject }>();

const { startProject, startProjectInput } = useStartProject();
const loading = ref(false);

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      startProjectInput.value.coopname = newProject.coopname || '';
      startProjectInput.value.project_hash = newProject.project_hash;
    }
  },
  { immediate: true },
);

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
