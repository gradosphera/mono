<template lang="pug">
q-dialog(
  :model-value='modelValue'
  @update:model-value='$emit("update:modelValue", $event)'
  persistent
  maximized
  transition-show='slide-up'
  transition-hide='slide-down'
)
  q-card.column.no-wrap
    q-bar.bg-primary.text-white
      .text-subtitle1
        | {{ reportTitle }} за {{ year }}{{ period ? ` · период ${period}` : '' }}
      q-space
      q-chip(
        :color='saveStatusColor'
        text-color='white'
        dense
      ) {{ saveStatusLabel }}
      q-btn(flat dense icon='fa-solid fa-xmark' @click='close')
        q-tooltip Закрыть

    //- Баннер ошибок генерации
    q-card-section.q-pa-sm(v-if='generationErrors.length')
      q-banner.bg-negative.text-white(dense)
        .text-caption(v-for='err in generationErrors' :key='err') {{ err }}

    //- Тело
    .row.no-wrap.col.overflow-hidden
      //- Центр — редактируемая форма
      .col.editor-container
        q-inner-loading(:showing='isLoading')
          q-spinner(size='40px' color='primary')

        BuhotchEditor(
          v-if='reportType === "BUHOTCH" && edits'
          :edits='buhotchEdits'
          :field-errors='fieldErrors'
          @update:edits='onBuhotchEditsUpdate'
          @dirty='onDirty'
        )

        ZeroReportEditor(
          v-else-if='reportType && reportType !== "BUHOTCH" && edits'
          :report-type='reportType'
          :edits='zeroEdits'
          :field-errors='fieldErrors'
          @update:edits='onZeroEditsUpdate'
          @dirty='onDirty'
        )

        .stub-other(v-else-if='!isLoading && !reportType')
          q-icon(name='fa-solid fa-triangle-exclamation' size='48px' color='warning')
          .text-subtitle1.q-mt-md Тип отчёта не задан

      //- Правая панель действий
      .action-panel.column.q-pa-md.no-wrap
        //- Валидация
        .validation-badge.q-mb-sm(:class='{ ok: isValid, bad: !isValid }')
          q-icon(:name='isValid ? "fa-solid fa-check" : "fa-solid fa-triangle-exclamation"')
          span(v-if='isValid') Форма валидна
          span(v-else) Ошибок: {{ errorsCount }}

        .text-subtitle2.q-mb-sm Действия

        q-btn.q-mb-sm(
          color='primary'
          icon='fa-solid fa-paper-plane'
          label='Скачать XML'
          :disable='!canGenerate'
          :loading='isGenerating'
          @click='downloadXml'
          no-caps
          stack
        )
          q-tooltip Сохраняет черновик, генерирует XML, валидирует XSD и скачивает файл
        q-btn.q-mb-sm(
          color='grey-7'
          icon='fa-solid fa-file-pdf'
          label='Скачать PDF'
          :disable='!canGenerate || reportType !== "BUHOTCH"'
          :loading='pdfLoading'
          @click='downloadPdf'
          no-caps
          stack
        )
          q-tooltip(v-if='reportType !== "BUHOTCH"') PDF-экспорт для {{ reportTitle }} будет в Sprint 3
          q-tooltip(v-else) Заполненный отчёт в PDF (из бумажного вида)

        q-separator.q-my-md

        q-btn.q-mb-sm(
          outline
          color='grey-8'
          icon='fa-solid fa-rotate'
          label='Перегенерировать'
          :disable='isLoading'
          @click='regenerate'
          no-caps
          stack
        )
          q-tooltip Подтянуть свежие данные из блокчейна; dirty-поля сохраняются

        q-btn(
          v-if='hasDraft'
          flat
          color='negative'
          icon='fa-solid fa-trash'
          label='Удалить черновик'
          @click='clearDraft'
          no-caps
          stack
        )
          q-tooltip Вернуть форму к дефолтам

        q-separator.q-my-md

        //- Отметка «не надо сдавать» — сохраняется в ReportSubmissionMark (coop-wide).
        .mark-hint.q-mb-sm(v-if='notRequiredMark')
          q-icon(name='fa-solid fa-circle-xmark' color='grey-7' size='14px')
          |  Этот период отмечен как «не надо сдавать»
        q-btn(
          :color='notRequiredMark ? "grey-7" : "secondary"'
          :outline='!notRequiredMark'
          :icon='notRequiredMark ? "fa-solid fa-rotate-left" : "fa-solid fa-ban"'
          :label='notRequiredMark ? "Снять отметку" : "Не надо сдавать"'
          :loading='markLoading'
          @click='toggleNotRequiredMark'
          no-caps
          stack
        )
          q-tooltip(v-if='notRequiredMark') Вернуть обычный статус периода
          q-tooltip(v-else) Отметить, что этот период не нужно сдавать — ячейка станет серой

        q-space

        q-btn(
          flat
          color='grey-8'
          icon='fa-solid fa-xmark'
          label='Закрыть'
          @click='close'
          no-caps
        )

    //- Скрытый paper-render для PDF-экспорта (рендерится по требованию)
    .hidden-pdf-source(v-show='false' ref='pdfSource')
      BuhotchForm(
        v-if='lastGeneratedXml && reportType === "BUHOTCH"'
        :xml='lastGeneratedXml'
        :requisites='requisites'
        :year='year'
      )
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Zeus } from '@coopenomics/sdk'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import {
  useReportDraft,
  useReportStore,
  type IReportRequisitesView,
  type IReportType,
} from 'src/entities/Report'
import BuhotchEditor from 'extensions/reports/widgets/report-forms/BuhotchEditor.vue'
import ZeroReportEditor from 'extensions/reports/widgets/report-forms/ZeroReportEditor.vue'
import BuhotchForm from 'extensions/reports/widgets/report-forms/BuhotchForm.vue'
import { exportFormToPdf, makePdfFileName } from 'extensions/reports/widgets/report-forms/pdf-export'

interface BalanceRow {
  otch: number
  prev: number
  prePrev: number
}

interface BuhotchEdits {
  header: {
    idFile: string
    programVersion: string
    docDate: string
    reportYear: number
    correctionNumber: number
    audit: boolean
    approved: boolean
  }
  organization: {
    orgName: string
    inn: string
    kpp: string
    address: string | null
    okpo: string | null
    okfs: string
    okopf: string
  }
  signer: {
    type: 'chairman' | 'representative'
    lastName: string
    firstName: string
    middleName: string | null
    repDoc: string | null
  }
  balance: {
    assetsTotal: BalanceRow
    nonMaterialAndLongFin: BalanceRow | null
    cash: BalanceRow | null
    shortTermFin: BalanceRow | null
    passivesTotal: BalanceRow
    targetFunds: BalanceRow | null
  }
  notes: {
    explanationFileName: string
  }
}

const REPORT_TITLES: Record<string, string> = {
  BUHOTCH: 'Бухотчётность (КНД 0710096)',
  NDFL6: '6-НДФЛ',
  RSV: 'РСВ',
  DUSN: 'Декларация УСН',
  FSS4: 'ЕФС-1',
  PSV: 'Персонифицированные сведения',
  UUSN: 'Уведомление УСН',
  UV_VZNOSY: 'Уведомление о взносах',
}

const props = defineProps<{
  modelValue: boolean
  reportType: IReportType | null
  year: number
  period?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'generated'): void
  (e: 'marked'): void
}>()

const reportStore = useReportStore()

const requisites = ref<IReportRequisitesView | null>(null)
const lastGeneratedXml = ref<string | null>(null)
const lastGeneratedFileName = ref<string | null>(null)
const generationErrors = ref<string[]>([])
const isGenerating = ref(false)
const pdfLoading = ref(false)
const pdfSource = ref<HTMLElement | null>(null)
// notRequiredMark — текущее наличие отметки «не надо сдавать» для (type, year, period).
// Подтягивается из календаря лениво при open; здесь храним только derivative-флаг,
// сам mark обновляется оптимистично после markReportPeriod() и refresh через календарь
// происходит на уровне родителя (DocumentsCalendarPage.onMarked).
const notRequiredMark = ref(false)
const markLoading = ref(false)

// useReportDraft требует фиксированного reportType — вводить per-open
// вместо per-dialog-lifetime. Для пересоздания пересоздаём сам composable
// через key в v-if.
// Вариант проще: открываем диалог только для BUHOTCH. Для остальных
// показываем заглушку (reportType !== BUHOTCH → composable не запускается).
const draft = useReportDraft<BuhotchEdits>(
  // fallback "BUHOTCH" — безопасен, т.к. при не-BUHOTCH верхний if-guard не даёт edits загружаться
  (props.reportType ?? 'BUHOTCH') as IReportType,
  props.year,
  props.period ?? null,
  { autoLoad: false },
)

const {
  edits,
  editedFields: _editedFields,
  fieldErrors,
  isValid,
  isLoading,
  isSaving,
  lastSavedAt,
  hasDraft,
  load,
  markDirty,
  saveNow,
  validateNow,
  regenerate: regenerateDraft,
  clear,
} = draft

const buhotchEdits = computed(() => edits.value as BuhotchEdits | null)

interface ZeroReportEdits {
  header: {
    idFile: string
    versProgram: string
    docDate: string
    reportYear: number
    period: number | null
    correctionNumber: number
  }
  organization: {
    orgName: string
    inn: string
    kpp: string
    oktmo: string | null
    okved: string | null
    okfs: string | null
    okopf: string | null
    okpo: string | null
    ogrn: string | null
    address: string | null
  }
  signer: {
    type: 'chairman' | 'representative'
    lastName: string
    firstName: string
    middleName: string | null
    repDoc: string | null
    snils: string | null
    sfrRegNumber: string | null
    chairmanPosition: string | null
  }
}

const zeroEdits = computed(() => edits.value as ZeroReportEdits | null)

const reportTitle = computed(() =>
  props.reportType ? (REPORT_TITLES[props.reportType] ?? props.reportType) : '',
)

const canGenerate = computed(() =>
  props.reportType !== null && edits.value !== null && !isLoading.value,
)

const errorsCount = computed(() => {
  let count = 0
  for (const msgs of Object.values(fieldErrors.value)) count += msgs.length
  return count
})

const saveStatusColor = computed(() => {
  if (isSaving.value) return 'orange'
  if (hasDraft.value) return 'positive'
  return 'grey'
})

const saveStatusLabel = computed(() => {
  if (isSaving.value) return 'Сохраняем…'
  if (hasDraft.value && lastSavedAt.value) {
    return `Черновик сохранён ${formatTime(lastSavedAt.value)}`
  }
  if (hasDraft.value) return 'Черновик'
  return 'Новый'
})

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Загрузка при открытии + реквизиты для paper-view.
// immediate: true — DocumentsPage монтирует этот диалог через v-if, поэтому
// на момент create() props.modelValue уже true и классический watcher
// false→true никогда не сработает (компонент просто стоит пустой).
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    generationErrors.value = []
    lastGeneratedXml.value = null
    lastGeneratedFileName.value = null
    notRequiredMark.value = false
    if (!props.reportType) return
    try {
      await load()
      if (!requisites.value) {
        requisites.value = (await reportStore.loadRequisites()) ?? null
      }
      // Подтягиваем текущий статус mark'а через календарь года. Календарь
      // и так нужен для UI — берём его одним запросом, вытягиваем запись
      // по (reportType, period).
      const cal = await reportStore.loadCalendar(props.year)
      const row = cal.find((r) => r.reportType === props.reportType)
      const entry = row?.periods.find((p) => (p.periodCode ?? null) === (props.period ?? null))
      notRequiredMark.value = entry?.status === Zeus.CalendarEntryStatus.NOT_REQUIRED
    } catch (e) {
      FailAlert(e, 'Ошибка загрузки формы')
    }
  },
  { immediate: true },
)

function onBuhotchEditsUpdate(next: BuhotchEdits): void {
  edits.value = next
}

function onZeroEditsUpdate(next: ZeroReportEdits): void {
  edits.value = next as unknown as BuhotchEdits  // useReportDraft дженерик с TEdits; внешнее хранение — один ref.
}

function onDirty(path: string): void {
  markDirty(path)
}

async function ensureGenerated(): Promise<{ xml: string; fileName: string } | null> {
  if (!edits.value || !props.reportType) return null
  generationErrors.value = []
  // SaveNow чтобы сервер знал финальное состояние — иначе regenerate
  // после ухода из диалога мог показать старое. Validate, чтобы зафиксировать
  // текущие ошибки полей перед попыткой генерации.
  await Promise.all([saveNow(), validateNow()])
  if (!isValid.value) {
    generationErrors.value = [
      `Есть ${errorsCount.value} ошибок в полях формы — исправьте перед скачиванием.`,
    ]
    return null
  }
  const out = await reportStore.generateFromEdits(
    props.reportType,
    props.year,
    props.period ?? null,
    JSON.stringify(edits.value),
  )
  if (!out) {
    generationErrors.value = ['Пустой ответ от сервера']
    return null
  }
  generationErrors.value = out.errors ?? []
  if (!out.xml) return null
  lastGeneratedXml.value = out.xml
  lastGeneratedFileName.value = out.fileName
  if (out.isValid) SuccessAlert('XML сгенерирован и прошёл XSD-валидацию')
  emit('generated')
  return { xml: out.xml, fileName: out.fileName }
}

async function downloadXml(): Promise<void> {
  if (isGenerating.value) return
  isGenerating.value = true
  try {
    const r = await ensureGenerated()
    if (!r) return
    reportStore.triggerDownload(r.xml, r.fileName)
  } catch (e) {
    FailAlert(e, 'Ошибка генерации XML')
  } finally {
    isGenerating.value = false
  }
}

async function downloadPdf(): Promise<void> {
  if (pdfLoading.value) return
  pdfLoading.value = true
  try {
    // Генерируем XML чтобы paper-view в BuhotchForm имел из чего рендерить.
    const r = await ensureGenerated()
    if (!r || !props.reportType) return
    // Ждём перерендера скрытого BuhotchForm (watch реактивно подхватил XML).
    await new Promise((resolve) => requestAnimationFrame(resolve))
    const root = pdfSource.value?.querySelector<HTMLElement>('.printable-form')
    if (!root) throw new Error('PDF: бумажный вид не отрендерился')
    const name = makePdfFileName(props.reportType, props.year, props.period ?? null)
    await exportFormToPdf(root, name)
  } catch (e) {
    FailAlert(e, 'Ошибка генерации PDF')
  } finally {
    pdfLoading.value = false
  }
}

async function regenerate(): Promise<void> {
  try {
    await regenerateDraft()
    SuccessAlert('Свежие данные подтянуты, ваши правки сохранены')
  } catch (e) {
    FailAlert(e, 'Ошибка перегенерации')
  }
}

async function clearDraft(): Promise<void> {
  try {
    await clear()
    await load()
    SuccessAlert('Черновик удалён, форма перезаполнена дефолтами')
  } catch (e) {
    FailAlert(e, 'Ошибка удаления черновика')
  }
}

async function toggleNotRequiredMark(): Promise<void> {
  if (!props.reportType || markLoading.value) return
  const shouldMark = !notRequiredMark.value
  const confirmMsg = shouldMark
    ? 'Отметить период как «не надо сдавать»? В календаре ячейка станет серой.'
    : 'Снять отметку «не надо сдавать»? Статус вернётся к обычному.'
  if (!window.confirm(confirmMsg)) return
  markLoading.value = true
  try {
    await reportStore.markPeriod({
      reportType: props.reportType,
      year: props.year,
      period: props.period ?? null,
      mark: shouldMark ? Zeus.ReportSubmissionMark.NOT_REQUIRED : null,
    })
    notRequiredMark.value = shouldMark
    SuccessAlert(shouldMark ? 'Отметка поставлена' : 'Отметка снята')
    emit('marked')
  } catch (e) {
    FailAlert(e, 'Ошибка установки отметки')
  } finally {
    markLoading.value = false
  }
}

function close(): void {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.editor-container {
  overflow: auto;
  background: #f5f6f8;
  position: relative;
}

.action-panel {
  width: 260px;
  flex: 0 0 260px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--q-neutral-2, #fafafa);
}

.stub-other {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px;
}

.hidden-pdf-source {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 210mm;
}

.validation-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  &.ok {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.bad {
    background: #ffebee;
    color: #c62828;
  }
}

.mark-hint {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #eceff1;
  border-radius: 4px;
}
</style>
