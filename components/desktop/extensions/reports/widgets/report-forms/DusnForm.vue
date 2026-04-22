<template lang="pug">
FormStub(
  :xml='xml'
  :requisites='requisites'
  :year='year'
  title='Налоговая декларация по УСН'
  knd='1152017'
  versForm='5.09'
  period='34'
)
</template>

<script setup lang="ts">
import type { IReportRequisitesView } from 'src/entities/Report'
import FormStub from './FormStub.vue'

// STUB. Замена на полноценную вёрстку: переписать template по бланку
// components/reports-standarts/ДУСН/1152017_5.09000_15.tif. XML-структура в
// components/controller/src/extensions/reports/infrastructure/generators/dusn.generator.ts
defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()
</script>
