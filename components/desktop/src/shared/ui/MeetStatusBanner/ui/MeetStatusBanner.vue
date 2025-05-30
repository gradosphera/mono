<template lang="pug">
// Баннер с информацией о статусе собрания
div
  div.text-center.q-mt-md(v-if="extendedStatus && extendedStatus !== 'NONE'")
    q-badge(
      :color="bannerConfig.color"
      :label="`${statusText} ${timeText}`"
      :outline="bannerConfig.outline"
      rounded
      style="font-size: 16px;"
    ).q-pa-sm

</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { EXTENDED_STATUS_MAP, STATUS_BANNER_CONFIG } from 'src/shared/lib/consts'
import { formatDateFromNow } from 'src/shared/lib/utils/dates/timezone'

const props = defineProps<{
  meet: IMeet
}>()

// Получаем расширенный статус собрания
const extendedStatus = computed(() => {
  return props.meet?.processing?.extendedStatus || 'NONE'
})

// Текст статуса собрания
const statusText = computed(() => {
  if (!props.meet?.processing?.extendedStatus) return 'Неизвестный статус'
  return EXTENDED_STATUS_MAP[props.meet.processing.extendedStatus] || 'Неизвестный статус'
})

// Конфигурация баннера
const bannerConfig = computed(() => {
  if (!props.meet?.processing?.extendedStatus) {
    return STATUS_BANNER_CONFIG['NONE']
  }
  return STATUS_BANNER_CONFIG[props.meet.processing.extendedStatus] || STATUS_BANNER_CONFIG['NONE']
})

// Форматированное время до открытия/закрытия с учетом часового пояса
const timeText = computed(() => {
  if (!bannerConfig.value.needTime) return ''

  // Для статуса WAITING_FOR_OPENING
  if (props.meet?.processing?.extendedStatus === 'WAITING_FOR_OPENING') {
    if (!props.meet?.processing?.meet?.open_at) return ''
    return formatDateFromNow(props.meet.processing.meet.open_at)
  }

  // Для статуса VOTING_IN_PROGRESS
  if (props.meet?.processing?.extendedStatus === 'VOTING_IN_PROGRESS') {
    if (!props.meet?.processing?.meet?.close_at) return ''
    return formatDateFromNow(props.meet.processing.meet.close_at)
  }

  return ''
})
</script>

<style lang="scss" scoped>
</style>
