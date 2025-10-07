<template lang="pug">
q-toggle(
  v-model='isProjectOpened',
  :color='isProjectOpened ? "blue" : "grey"',
  :label='isProjectOpened ? "Открыт для инвестиций" : "Закрыт от инвестиций"',
  :loading='loading',
  @update:model-value='handleToggleChange'
)
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useOpenCloseProject } from '../model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

const props = defineProps<{ project: IProject }>();

const { openProject, closeProject } = useOpenCloseProject();
const store = useProjectStore();
const loading = ref(false);

// Получаем актуальный проект из store по hash
const currentProject = computed(() => {
  // Ищем проект в store по hash
  const projects = store.projects?.items || [];
  return projects.find(p => p.project_hash === props.project?.project_hash) || props.project;
});

// Определяем открыт ли проект для инвестиций
const isProjectOpened = computed(() => currentProject.value?.is_opened === true);

const handleToggleChange = async (value: boolean) => {
  if (!currentProject.value) return;

  loading.value = true;
  try {
    const inputData = {
      coopname: currentProject.value.coopname || '',
      project_hash: currentProject.value.project_hash,
    };

    if (value) {
      // Открываем проект для инвестиций
      await openProject(inputData);
    } else {
      // Закрываем проект от инвестиций
      await closeProject(inputData);
    }
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
