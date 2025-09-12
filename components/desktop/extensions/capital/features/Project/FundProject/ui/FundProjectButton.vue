<template lang="pug">
q-btn(
  color='primary',
  @click='handleFundProject',
  :loading='loading',
  label='Финансировать проект'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFundProject } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { fundProject, fundProjectInput } = useFundProject();
const loading = ref(false);

const handleFundProject = async () => {
  loading.value = true;
  try {
    await fundProject(fundProjectInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
