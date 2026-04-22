<template lang="pug">
FormStub(
  :xml='xml'
  :requisites='requisites'
  :year='year'
  title='Персонифицированные сведения о физических лицах'
  knd='1151162'
  versForm='5.01'
)
</template>

<script setup lang="ts">
import type { IReportRequisitesView } from 'src/entities/Report'
import FormStub from './FormStub.vue'

// STUB. Бланк: components/reports-standarts/ПСВ/1151162_5.01000_01.tif
// Генератор: infrastructure/generators/psv.generator.ts
defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()
</script>
