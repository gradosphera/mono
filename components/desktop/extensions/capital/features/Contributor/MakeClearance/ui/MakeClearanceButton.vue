<template lang="pug">
q-btn(
  color='primary',
  @click='handleMakeClearance',
  :loading='loading',
  label='Подписать приложение'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMakeClearance } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { makeClearance, makeClearanceInput } = useMakeClearance();
const loading = ref(false);

const handleMakeClearance = async () => {
  loading.value = true;
  try {
    await makeClearance(makeClearanceInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
