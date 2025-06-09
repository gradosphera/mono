<template lang="pug">
// Баннер с информацией о статусе собрания
div.full-width
  q-banner(
    v-if="extendedStatus && extendedStatus !== 'NONE'",
    rounded,
    :class="bannerClasses"
    :style="bannerStyle"
  ).q-pa-md
    template(v-slot:avatar)
      q-icon(:name="bannerConfig.icon" :color="iconColor")
    div {{ statusText }} {{ timeText }}


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
  return (
    STATUS_BANNER_CONFIG[props.meet.processing.extendedStatus] || STATUS_BANNER_CONFIG['NONE']
  )
})

const bannerClasses = computed(() => {
  const config = bannerConfig.value
  if (config.outline) {
    return 'bg-grey-1 outlined-banner'
  }
  return `bg-${config.color} text-white`
})

const bannerStyle = computed(() => {
  const config = bannerConfig.value
  if (config.outline) {
    return { borderColor: `var(--q-color-${config.color})` }
  }
  return {}
})

const iconColor = computed(() => {
  const config = bannerConfig.value
  return config.outline ? config.color : 'white'
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
.outlined-banner {
  border-width: 1px;
  border-style: solid;
}
</style>
