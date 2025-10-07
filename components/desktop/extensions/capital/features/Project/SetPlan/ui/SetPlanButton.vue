<template lang="pug">
q-btn(
  size='sm',
  color='primary',
  @click='handleSetPlan',
  :loading='loading',
  label='Установить план проекта'
)
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSetPlan } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject | null }>();

const { setPlan, setPlanInput } = useSetPlan();
const loading = ref(false);

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      setPlanInput.value.coopname = newProject.coopname || '';
      setPlanInput.value.project_hash = newProject.project_hash;
      setPlanInput.value.master = newProject.master || '';
    }
  },
  { immediate: true },
);

const handleSetPlan = async () => {
  loading.value = true;
  try {
    console.log('setPlanInput', setPlanInput.value);
    await setPlan(setPlanInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
