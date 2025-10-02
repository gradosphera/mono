<template lang="pug">
q-btn(
  size='sm',
  color='primary',
  @click='handleOpenProject',
  :loading='loading',
  label='Открыть проект для инвестиций'
)
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useOpenProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject | null }>();

const { openProject, openProjectInput } = useOpenProject();
const loading = ref(false);

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      openProjectInput.value.coopname = newProject.coopname || '';
      openProjectInput.value.project_hash = newProject.project_hash;
    }
  },
  { immediate: true },
);

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
