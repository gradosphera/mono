<template lang="pug">
q-btn(
  color='primary',
  @click='handleSetMaster',
  :loading='loading',
  label='Установить мастера проекта'
)
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSetMaster } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject | null }>();

const { setMaster, setMasterInput } = useSetMaster();
const loading = ref(false);

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      setMasterInput.value.coopname = newProject.coopname || '';
      setMasterInput.value.project_hash = newProject.project_hash;
    }
  },
  { immediate: true },
);

const handleSetMaster = async () => {
  loading.value = true;
  try {
    await setMaster(setMasterInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
