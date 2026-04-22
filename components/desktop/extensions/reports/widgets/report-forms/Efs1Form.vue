<template lang="pug">
FormStub(
  :xml='xml'
  :requisites='requisites'
  :year='year'
  title='ЕФС-1 / 4-ФСС (сведения для СФР)'
  knd='—'
)
</template>

<script setup lang="ts">
import type { IReportRequisitesView } from 'src/entities/Report'
import FormStub from './FormStub.vue'

// STUB. ЕФС-1 — это форма СФР, КНД по ФНС-классификатору у неё нет.
// Бланк: components/reports-standarts/4ФСС-ЕФС-1/Prilojenie_1_forma_EFS-1_prikaz_1462_17.11.2025.xls
// (xls с 6 листами — раздел 1.1, 1.2-3, 2.1, 2.2, 2.3). XSD под
// targetNamespace 2026-01-01 в controller/.../schemas/efs1/efs1.xsd.
// Генератор: infrastructure/generators/efs1.generator.ts
defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()
</script>
