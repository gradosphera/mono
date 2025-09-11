<template lang="pug">
q-btn(
  color='primary',
  @click='handlePushResult',
  :loading='loading',
  label='Добавить результат'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePushResult } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { pushResult, pushResultInput } = usePushResult();
const loading = ref(false);

const handlePushResult = async () => {
  loading.value = true;
  try {
    await pushResult(pushResultInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
