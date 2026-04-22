<template lang="pug">
div.page-shell
  //- Расписание отчётов
  q-card.q-mt-md(flat)
    q-card-section
      .row.items-center
        .text-h6.col Доступные формы
        q-btn(flat dense icon='fa-solid fa-rotate' @click='loadAll' :loading='reportStore.loading')
          q-tooltip Обновить

    q-separator

    q-card-section
      q-table(
        :rows='visibleReports'
        :columns='columns'
        row-key='type'
        flat
        :loading='reportStore.loading'
        hide-pagination
        :pagination='{ rowsPerPage: 0 }'
      )
        template(#body-cell-period='props')
          q-td(:props='props')
            q-chip(:color='periodColor(props.row.period)' text-color='white' dense) {{ periodLabel(props.row.period) }}

        template(#body-cell-ready='props')
          q-td(:props='props')
            q-icon(
              v-if='props.row.readyToGenerate'
              name='fa-solid fa-check-circle'
              color='positive'
              size='20px'
            )
              q-tooltip Реквизиты заполнены
            q-icon(
              v-else
              name='fa-solid fa-triangle-exclamation'
              color='warning'
              size='20px'
            )
              q-tooltip {{ missingTooltip(props.row) }}

        template(#body-cell-actions='props')
          q-td(:props='props')
            q-btn(
              v-if='props.row.readyToGenerate'
              flat dense
              icon='fa-solid fa-pen-to-square'
              color='primary'
              @click='openEditor(props.row)'
            )
              q-tooltip Открыть редактор формы
            q-btn(
              v-else
              flat dense
              icon='fa-solid fa-gear'
              color='warning'
              :to='{ name: "reports-settings", query: { focus: firstMissing(props.row) } }'
            )
              q-tooltip Заполнить реквизиты

  //- Архив
  q-card.q-mt-md(flat)
    q-card-section
      .row.items-center
        .text-h6.col Архив отчётов

    q-separator

    q-card-section
      .row.q-gutter-sm.items-end.q-mb-md
        q-select.col-md-3.col-12(
          v-model='archiveFilter.reportType'
          :options='archiveTypeOptions'
          label='Тип отчёта'
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value='onFilterChange'
        )
        q-input.col-md-2.col-12(
          v-model.number='archiveFilter.year'
          label='Год'
          type='number'
          dense
          outlined
          clearable
          :min='2000'
          :max='2100'
          debounce='400'
          @update:model-value='onFilterChange'
        )

      q-table(
        :rows='reportStore.archive.items'
        :columns='archiveColumns'
        row-key='id'
        flat
        :loading='reportStore.archiveLoading'
        :pagination='archivePagination'
        @request='onArchiveRequest'
      )
        template(#body-cell-valid='props')
          q-td(:props='props')
            q-chip(
              :color='props.row.isValid ? "positive" : "negative"'
              text-color='white'
              dense
              size='sm'
            ) {{ props.row.isValid ? 'Валиден' : 'Ошибки' }}

        template(#body-cell-createdAt='props')
          q-td(:props='props') {{ formatDate(props.row.createdAt) }}

        template(#body-cell-actions='props')
          q-td(:props='props')
            q-btn(
              flat dense
              icon='fa-solid fa-download'
              color='primary'
              @click='downloadArchive(props.row.id)'
            )
              q-tooltip Скачать XML

  ReportEditorDialog(
    v-if='showEditor'
    v-model='showEditor'
    :report-type='editorReportType'
    :year='editorYear'
    :period='editorPeriod'
    @generated='onGenerated'
  )
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { FailAlert } from 'src/shared/api'
import {
  useReportStore,
  type IAvailableReport,
  type IReportType,
} from 'src/entities/Report'
import ReportEditorDialog from './ReportEditorDialog.vue'

const MVP_REPORT_TYPES = ['BUHOTCH', 'NDFL6', 'RSV', 'DUSN', 'FSS4'] as IReportType[]

const REPORT_TYPE_LABELS: Record<string, string> = {
  BUHOTCH: 'Бухотчётность',
  NDFL6: 'НДФЛ-6',
  RSV: 'РСВ',
  DUSN: 'ДУСН',
  FSS4: 'ЕФС-1',
  PSV: 'ПСВ',
  UV_VZNOSY: 'УВ-Взносы',
  UUSN: 'УСН',
}

function reportLabel(type: string, fallbackName?: string): string {
  return REPORT_TYPE_LABELS[type] ?? fallbackName ?? type
}

const reportStore = useReportStore()
const { reports } = storeToRefs(reportStore)

const showEditor = ref(false)
const editorReportType = ref<IReportType | null>(null)
const editorYear = ref(new Date().getFullYear() - 1)
const editorPeriod = ref<number | null>(null)

const archivePagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 })
const archiveFilter = reactive<{ reportType: IReportType | null; year: number | null }>({
  reportType: null,
  year: null,
})

watch(
  () => reportStore.archive.total,
  (n) => {
    archivePagination.value.rowsNumber = n
  },
)

const visibleReports = computed(() =>
  reports.value.filter((r) => MVP_REPORT_TYPES.includes(r.type as IReportType)),
)

const columns = [
  { name: 'name', label: 'Отчёт', field: 'name', align: 'left' as const, sortable: true },
  { name: 'period', label: 'Периодичность', field: 'period', align: 'center' as const },
  { name: 'deadline', label: 'Срок сдачи', field: 'deadline', align: 'left' as const },
  { name: 'ready', label: 'Готовность', field: 'readyToGenerate', align: 'center' as const },
  { name: 'actions', label: '', field: 'type', align: 'right' as const },
]

const archiveColumns = [
  { name: 'reportType', label: 'Тип', field: 'reportType', align: 'left' as const },
  { name: 'year', label: 'Год', field: 'year', align: 'center' as const },
  { name: 'period', label: 'Период', field: 'period', align: 'center' as const },
  { name: 'fileName', label: 'Файл', field: 'fileName', align: 'left' as const },
  { name: 'valid', label: 'Валидация', field: 'isValid', align: 'center' as const },
  { name: 'createdAt', label: 'Сгенерирован', field: 'createdAt', align: 'left' as const },
  { name: 'actions', label: '', field: 'id', align: 'right' as const },
]

const archiveTypeOptions = computed(() =>
  MVP_REPORT_TYPES.map((t) => {
    const found = reports.value.find((r) => r.type === t)
    return { label: reportLabel(t, found?.name), value: t }
  }),
)

function periodLabel(p: string) {
  return ({ yearly: 'Ежегодно', quarterly: 'Ежеквартально', monthly: 'Ежемесячно' }[p] ?? p)
}

function periodColor(p: string) {
  return ({ yearly: 'deep-purple', quarterly: 'blue', monthly: 'teal' }[p] ?? 'grey')
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function missingTooltip(r: IAvailableReport) {
  if (!r.missingFields || r.missingFields.length === 0) return 'Не все реквизиты заполнены'
  return `Не заполнено: ${r.missingFields.join(', ')}`
}

function firstMissing(r: IAvailableReport): string {
  return (r.missingFields && r.missingFields[0]) || ''
}

async function loadAll() {
  await Promise.all([loadReports(), loadArchive()])
}

async function loadReports() {
  try {
    await reportStore.loadReports()
  } catch (e) {
    FailAlert(e, 'Ошибка загрузки')
  }
}

async function loadArchive() {
  // UI-валидация year: бэк требует @Min(2000)/@Max(2100); иначе keystroke
  // «2026 → 202» рождает 400 и красный toast.
  const yr = archiveFilter.year
  if (yr !== null && yr !== undefined && (yr < 2000 || yr > 2100)) {
    reportStore.archive.items = []
    reportStore.archive.total = 0
    archivePagination.value.rowsNumber = 0
    return
  }

  try {
    await reportStore.loadArchive({
      reportType: archiveFilter.reportType ?? undefined,
      year: archiveFilter.year ?? undefined,
      limit: archivePagination.value.rowsPerPage,
      offset: (archivePagination.value.page - 1) * archivePagination.value.rowsPerPage,
    })
  } catch (e) {
    FailAlert(e, 'Архив')
  }
}

function onFilterChange() {
  archivePagination.value.page = 1
  loadArchive()
}

function onArchiveRequest(props: { pagination: { page: number; rowsPerPage: number; rowsNumber?: number } }) {
  archivePagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? archivePagination.value.rowsNumber,
  }
  loadArchive()
}

async function downloadArchive(id: string) {
  try {
    const r = await reportStore.getReport(id)
    if (!r) throw new Error('Не удалось получить отчёт')
    reportStore.triggerDownload(r.xml, r.fileName)
  } catch (e) {
    FailAlert(e, 'Ошибка скачивания')
  }
}

function defaultPeriodFor(p: string): number | null {
  // Для yearly — null (нет периода). Для quarterly/monthly — 1.
  if (p === 'yearly') return null
  return 1
}

function openEditor(r: IAvailableReport) {
  editorReportType.value = r.type as IReportType
  // yearly: отчитываемся за предыдущий год (2026→2025);
  // quarterly/monthly: текущий год.
  editorYear.value = r.period === 'yearly'
    ? new Date().getFullYear() - 1
    : new Date().getFullYear()
  editorPeriod.value = defaultPeriodFor(r.period)
  showEditor.value = true
}

async function onGenerated() {
  await Promise.all([loadArchive(), loadReports()])
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.hero-card {
  background: var(--q-primary-10, #f3f6fb);
}
</style>
