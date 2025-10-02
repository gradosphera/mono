<template lang="pug">
q-toggle(
  v-model='isProjectActive',
  :color='isProjectActive ? "green" : "orange"',
  :label='isProjectActive ? "Проект активен" : "Проект остановлен"',
  :loading='loading',
  @update:model-value='handleToggleChange'
)
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { useStartProject } from '../../features/Project/StartProject/model';
import { useStopProject } from '../../features/Project/StopProject/model';
import { useProjectStore } from '../../entities/Project/model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../entities/Project/model';

const props = defineProps<{ project: IProject }>();

const { startProject } = useStartProject();
const { stopProject } = useStopProject();
const store = useProjectStore();
const loading = ref(false);

// Получаем актуальный проект из store по hash
const currentProject = computed(() => {
  // Ищем проект в store по hash
  const projects = store.projects?.items || [];
  return projects.find(p => p.project_hash === props.project?.project_hash) || props.project;
});

// Определяем активен ли проект на основе статуса
const isProjectActive = computed(() => currentProject.value?.status === Zeus.ProjectStatus.ACTIVE);

const handleToggleChange = async (value: boolean) => {
  if (!currentProject.value) return;

  loading.value = true;
  try {
    const inputData = {
      coopname: currentProject.value.coopname || '',
      project_hash: currentProject.value.project_hash,
    };

    if (value) {
      // Запускаем проект (из PENDING в ACTIVE)
      await startProject(inputData);
    } else {
      // Останавливаем проект (из ACTIVE в PENDING)
      await stopProject(inputData);
    }
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
