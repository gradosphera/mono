<template lang="pug">
.q-pa-md
  ReportsCalendar(@select='onCalendarSelect')

  ReportEditorDialog(
    v-if='showEditor'
    v-model='showEditor'
    :report-type='editorReportType'
    :year='editorYear'
    :period='editorPeriod'
    @generated='onGenerated'
    @marked='onMarked'
  )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useReportStore, type IReportType } from 'src/entities/Report'
import ReportsCalendar from 'extensions/reports/widgets/reports-calendar/ReportsCalendar.vue'
import ReportEditorDialog from './ReportEditorDialog.vue'

const reportStore = useReportStore()

const showEditor = ref(false)
const editorReportType = ref<IReportType | null>(null)
const editorYear = ref(new Date().getFullYear() - 1)
const editorPeriod = ref<number | null>(null)

function onCalendarSelect(payload: { reportType: IReportType; year: number; period: number | null }) {
  editorReportType.value = payload.reportType
  editorYear.value = payload.year
  editorPeriod.value = payload.period
  showEditor.value = true
}

async function onGenerated() {
  // Обновляем календарь — статус ячейки изменился (empty/draft → submitted).
  await reportStore.loadCalendar(editorYear.value).catch(() => {})
}

async function onMarked() {
  // После postановки/снятия «Не надо сдавать» — перезагружаем календарь
  // и закрываем диалог (редактировать не нужно).
  await reportStore.loadCalendar(editorYear.value).catch(() => {})
  showEditor.value = false
}
</script>
