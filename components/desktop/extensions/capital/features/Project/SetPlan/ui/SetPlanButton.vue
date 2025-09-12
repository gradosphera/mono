<template lang="pug">
q-btn(
  color='primary',
  @click='handleSetPlan',
  :loading='loading',
  label='Установить план проекта'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSetPlan } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { setPlan, setPlanInput } = useSetPlan();
const loading = ref(false);

const handleSetPlan = async () => {
  loading.value = true;
  try {
    await setPlan(setPlanInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
