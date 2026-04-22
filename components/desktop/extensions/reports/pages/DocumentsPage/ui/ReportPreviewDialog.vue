<template lang="pug">
q-dialog(
  :model-value='modelValue'
  @update:model-value='$emit("update:modelValue", $event)'
  maximized
  transition-show='slide-up'
  transition-hide='slide-down'
)
  q-card.column.no-wrap
    //- Шапка диалога
    q-bar.bg-primary.text-white
      .text-subtitle1 Отчёт: {{ result?.fileName }}
      q-space
      q-chip(
        :color='result?.isValid ? "positive" : "negative"'
        text-color='white'
        dense
      ) {{ result?.isValid ? 'Валиден' : 'Ошибки' }}
      q-btn(flat dense icon='fa-solid fa-xmark' @click='close')
        q-tooltip Закрыть

    //- Ошибки сверху (если есть)
    q-card-section.q-pa-sm(v-if='result?.errors?.length')
      q-banner.bg-negative.text-white(dense)
        .text-caption(v-for='err in result.errors' :key='err') {{ err }}

    //- Тело: слева форма, справа панель действий
    .row.no-wrap.col.overflow-hidden
      //- Центр — визуальная форма
      .col.preview-container
        component(
          v-if='formComponent && result?.xml'
          :is='formComponent'
          :xml='result.xml'
          :requisites='requisites'
          :year='result.year'
        )
        .no-preview(v-else)
          | Нет данных для отображения

      //- Правая панель — скачивания
      .action-panel.column.q-pa-md.no-wrap
        .text-subtitle2.q-mb-sm Скачать
        q-btn.q-mb-sm(
          color='primary'
          icon='fa-solid fa-file-code'
          label='XML отчёта'
          :disable='!result?.xml'
          @click='$emit("download-xml")'
          no-caps
          stack
        )
          q-tooltip(v-if='!result?.isValid') Отчёт невалиден — исправьте ошибки перед сдачей
        q-btn.q-mb-sm(
          color='secondary'
          icon='fa-solid fa-file-lines'
          label='XSD-схема'
          @click='downloadXsd'
          :loading='xsdLoading'
          no-caps
          stack
        )
          q-tooltip Схема ФНС/СФР — используется для валидации XML
        q-btn.q-mb-sm(
          color='grey-7'
          icon='fa-solid fa-file-pdf'
          label='PDF-бланк'
          @click='downloadPdf'
          :loading='pdfLoading'
          :disable='!pdfAvailable'
          no-caps
          stack
        )
          q-tooltip(v-if='!pdfAvailable') PDF-бланк для этой формы пока недоступен
          q-tooltip(v-else) Пустой печатный бланк формы
        q-separator.q-my-md
        q-btn(
          flat
          color='grey-8'
          icon='fa-solid fa-xmark'
          label='Закрыть'
          @click='close'
          no-caps
        )
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw, type Component } from 'vue'
import { FailAlert } from 'src/shared/api'
import { useReportStore, type IGeneratedReport, type IReportRequisitesView } from 'src/entities/Report'
import BuhotchForm from 'extensions/reports/widgets/report-forms/BuhotchForm.vue'
import DusnForm from 'extensions/reports/widgets/report-forms/DusnForm.vue'
import Ndfl6Form from 'extensions/reports/widgets/report-forms/Ndfl6Form.vue'
import RsvForm from 'extensions/reports/widgets/report-forms/RsvForm.vue'
import PsvForm from 'extensions/reports/widgets/report-forms/PsvForm.vue'
import UusnForm from 'extensions/reports/widgets/report-forms/UusnForm.vue'
import Efs1Form from 'extensions/reports/widgets/report-forms/Efs1Form.vue'

// Статичная мапа reportType → Vue-компонент формы. markRaw — чтобы Vue не
// делал объекты компонентов реактивными, это дёшево и отключает лишний
// watcher. Добавляя новую форму-обёртку — регистрируй её здесь.
const FORM_COMPONENTS: Record<string, Component> = {
  BUHOTCH: markRaw(BuhotchForm),
  DUSN: markRaw(DusnForm),
  NDFL6: markRaw(Ndfl6Form),
  RSV: markRaw(RsvForm),
  PSV: markRaw(PsvForm),
  UUSN: markRaw(UusnForm),
  UV_VZNOSY: markRaw(UusnForm), // та же форма, другой контекст сдачи
  FSS4: markRaw(Efs1Form),
}

const props = defineProps<{
  modelValue: boolean
  result: IGeneratedReport | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'download-xml'): void
}>()

const reportStore = useReportStore()

const requisites = ref<IReportRequisitesView | null>(null)
const xsdLoading = ref(false)
const pdfLoading = ref(false)

const formComponent = computed<Component | undefined>(() => {
  const t = props.result?.reportType
  if (!t) return undefined
  return FORM_COMPONENTS[t]
})

// Для BUHOTCH forma парсит XML+requisites, остальные пока stub'ы —
// реквизиты им тоже полезны (шапка). Подгружаем всегда, когда форма есть.
const needsRequisites = computed(() => formComponent.value != null)

// Список выровнен с PDF_BLANK_MAP в controller/report-standards.service.ts —
// при расширении карты обновить и здесь.
const PDF_AVAILABLE: Record<string, boolean> = {
  BUHOTCH: true,
  DUSN: true,
  NDFL6: true,
  PSV: true,
  RSV: true,
  UV_VZNOSY: true,
  UUSN: true,
  FSS4: true,
}
const pdfAvailable = computed(() => {
  const t = props.result?.reportType
  if (!t) return false
  return PDF_AVAILABLE[t] ?? false
})

watch(
  () => props.modelValue,
  async (v) => {
    if (!v) return
    if (needsRequisites.value && !requisites.value) {
      try {
        requisites.value = (await reportStore.loadRequisites()) ?? null
      } catch (e) {
        // Не фейлим диалог — форма отрисуется по XML без fallback-шапки.
        console.warn('[ReportPreviewDialog] requisites load failed', e)
      }
    }
  },
)

async function downloadXsd() {
  if (!props.result?.reportType) return
  xsdLoading.value = true
  try {
    await reportStore.downloadXsd(props.result.reportType)
  } catch (e) {
    FailAlert(e, 'Ошибка скачивания XSD')
  } finally {
    xsdLoading.value = false
  }
}

async function downloadPdf() {
  if (!props.result?.reportType) return
  pdfLoading.value = true
  try {
    await reportStore.downloadBlankPdf(props.result.reportType)
  } catch (e) {
    FailAlert(e, 'Ошибка скачивания PDF-бланка')
  } finally {
    pdfLoading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.preview-container {
  overflow: auto;
  background: #e6e7eb;
  padding: 16px 0;
}

.no-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-style: italic;
}

.action-panel {
  width: 240px;
  flex: 0 0 240px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--q-neutral-2, #fafafa);
}
</style>
