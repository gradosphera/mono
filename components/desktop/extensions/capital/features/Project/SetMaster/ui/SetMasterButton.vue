<template lang="pug">
q-btn(
  color='primary',
  @click='handleSetMaster',
  :loading='loading',
  label='Установить мастера проекта'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSetMaster } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { setMaster, setMasterInput } = useSetMaster();
const loading = ref(false);

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
