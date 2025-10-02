<template lang="pug">
q-toggle(
  v-model='isProjectActive',
  color='green',
  :label='isProjectActive ? "Проект активен" : "Проект не активен"',
  :disable='isProjectActive',
  :loading='loading',
  @update:model-value='handleToggleChange'
)
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { useStartProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject }>();

const { startProject, startProjectInput } = useStartProject();
const loading = ref(false);

const isProjectActive = computed(() => props.project?.status === Zeus.ProjectStatus.ACTIVE);

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

const handleToggleChange = async (value: boolean) => {
  if (value && !isProjectActive.value) {
    // Включаем проект
    loading.value = true;
    try {
      await startProject(startProjectInput.value);
    } catch (error) {
      FailAlert(error);
    } finally {
      loading.value = false;
    }
  }
  // Если value = false, ничего не делаем (нельзя выключить активный проект)
};
</script>
