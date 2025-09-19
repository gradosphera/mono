<template lang="pug">
.row.items-center(
  :style="{ minHeight: '24px', padding: '0px !important' }"
)
  .text-caption(
    :class="statusTextClass"
    style='transition: opacity 0.3s ease'
  )
    | {{ statusText }}

</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isAutoSaving?: boolean
  autoSaveError?: string | null
  savingText?: string
  errorText?: string
}

const props = withDefaults(defineProps<Props>(), {
  isAutoSaving: false,
  autoSaveError: null,
  savingText: 'Авто-сохранение...',
  errorText: 'Ошибка сохранения'
})


// Класс для текста статуса
const statusTextClass = computed(() => ({
  'text-grey-6': props.isAutoSaving,
  'text-negative': props.autoSaveError,
  'text-transparent': !props.isAutoSaving && !props.autoSaveError
}))

// Текст статуса
const statusText = computed(() => {
  if (props.isAutoSaving) return props.savingText
  if (props.autoSaveError) return props.autoSaveError
  return ' ' // Невидимый текст для сохранения места
})
</script>

<style scoped>

</style>
