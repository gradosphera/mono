<template lang="pug">
FormStub(
  :xml='xml'
  :requisites='requisites'
  :year='year'
  title='Расчёт по страховым взносам (РСВ)'
  knd='1151111'
  versForm='5.08'
)
</template>

<script setup lang="ts">
import type { IReportRequisitesView } from 'src/entities/Report'
import FormStub from './FormStub.vue'

// STUB. Бланк: components/reports-standarts/РСВ/1151111_5.08000_11.tif (20 листов)
// Генератор: infrastructure/generators/rsv.generator.ts
defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()
</script>
