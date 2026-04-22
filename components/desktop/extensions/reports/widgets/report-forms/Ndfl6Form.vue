<template lang="pug">
FormStub(
  :xml='xml'
  :requisites='requisites'
  :year='year'
  title='Расчёт сумм НДФЛ (форма 6-НДФЛ)'
  knd='1151100'
  versForm='5.05'
)
</template>

<script setup lang="ts">
import type { IReportRequisitesView } from 'src/entities/Report'
import FormStub from './FormStub.vue'

// STUB. Бланк: components/reports-standarts/6-НДФЛ/1151100_5.05000_09.tif
// Генератор: infrastructure/generators/ndfl6.generator.ts
defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()
</script>
