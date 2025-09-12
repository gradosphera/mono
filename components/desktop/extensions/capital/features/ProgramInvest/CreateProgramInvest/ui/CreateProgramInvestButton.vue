<template lang="pug">
q-btn(
  color='primary',
  @click='handleCreateProgramInvest',
  :loading='loading',
  label='Создать программную инвестицию'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateProgramInvest } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { createProgramInvest, createProgramInvestInput } =
  useCreateProgramInvest();
const loading = ref(false);

const handleCreateProgramInvest = async () => {
  loading.value = true;
  try {
    await createProgramInvest(createProgramInvestInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
