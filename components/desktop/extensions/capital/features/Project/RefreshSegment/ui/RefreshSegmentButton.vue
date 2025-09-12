<template lang="pug">
q-btn(
  color='primary',
  @click='handleRefreshSegment',
  :loading='loading',
  label='Обновить сегмент'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRefreshSegment } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { refreshSegment, refreshSegmentInput } = useRefreshSegment();
const loading = ref(false);

const handleRefreshSegment = async () => {
  loading.value = true;
  try {
    await refreshSegment(refreshSegmentInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
