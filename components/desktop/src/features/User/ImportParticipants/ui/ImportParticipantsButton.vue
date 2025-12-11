<template lang="pug">
q-btn(
  color='primary',
  @click='show = true',
  icon='upload_file',
  push,
  :stretch='isMobile',
  :size='isMobile ? "sm" : "md"'
)
  span.q-pr-sm импорт
  ParticipantsImportDialog(v-model='show')
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWindowSize } from 'src/shared/hooks';
import ParticipantsImportDialog from './ParticipantsImportDialog.vue';

const { isMobile } = useWindowSize();
const show = ref(false);
</script>
