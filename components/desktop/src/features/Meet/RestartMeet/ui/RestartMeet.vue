<template lang="pug">
div
  q-btn(
    v-if="showButton"
    color="primary"
    icon="fa-solid fa-rotate"
    label="Перезапустить собрание"
    @click="showRestartDialog = true"
    :loading="isProcessing"
  )

  RestartMeetForm(
    v-model="showRestartDialog"
    :meet="meet"
    :loading="isProcessing"
    @restart="handleRestart"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RestartMeetForm } from '.';
import type { IMeet } from 'src/entities/Meet'

defineProps<{
  meet: IMeet
  showButton?: boolean
}>()

const emit = defineEmits<{
  (e: 'restart', data: any): void
}>()

const showRestartDialog = ref(false)
const isProcessing = ref(false)

const handleRestart = async (data: any) => {
  isProcessing.value = true
  try {
    await emit('restart', data)
    showRestartDialog.value = false
  } finally {
    isProcessing.value = false
  }
}
</script> 