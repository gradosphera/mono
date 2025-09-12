<template lang="pug">
q-btn(
  color='primary',
  @click='handleConvertSegment',
  :loading='loading',
  label='Конвертировать сегмент'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConvertSegment } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { convertSegment, convertSegmentInput } = useConvertSegment();
const loading = ref(false);

const handleConvertSegment = async () => {
  loading.value = true;
  try {
    await convertSegment(convertSegmentInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
