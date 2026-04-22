<template lang="pug">
FormStub(
  :xml='xml'
  :requisites='requisites'
  :year='year'
  title='Уведомление об исчисленных суммах налогов'
  knd='1110355'
  versForm='5.03'
)
</template>

<script setup lang="ts">
import type { IReportRequisitesView } from 'src/entities/Report'
import FormStub from './FormStub.vue'

// STUB. Одна форма используется для UUSN и UV_VZNOSY (разные контексты сдачи).
// Бланк: components/reports-standarts/Уведомление об исчисленных взносах/1110355_5.03000_03.tif
// Генератор: infrastructure/generators/uusn.generator.ts (и uv-vznosy.generator.ts)
defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()
</script>
