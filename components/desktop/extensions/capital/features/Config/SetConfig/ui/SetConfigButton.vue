<template lang="pug">
q-btn(
  color='primary',
  @click='handleSetConfig',
  :loading='loading',
  label='Установить конфигурацию'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSetConfig } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { setConfig, setConfigInput } = useSetConfig();
const loading = ref(false);

const handleSetConfig = async () => {
  loading.value = true;
  try {
    await setConfig(setConfigInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
