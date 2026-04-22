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
      .col.preview-container(ref='previewRoot')
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
          icon='fa-solid fa-paper-plane'
          label='Для отправки (XML)'
          :disable='!result?.xml'
          @click='$emit("download-xml")'
          no-caps
          stack
        )
          q-tooltip(v-if='!result?.isValid') Отчёт невалиден — исправьте ошибки перед сдачей
          q-tooltip(v-else) Готовый XML для загрузки в Контур/СБИС/1С
        q-btn.q-mb-sm(
          color='grey-7'
          icon='fa-solid fa-file-pdf'
          label='Для просмотра (PDF)'
          @click='downloadPdf'
          :loading='pdfLoading'
          :disable='!formComponent'
          no-caps
          stack
        )
          q-tooltip Заполненный отчёт в PDF — для печати и архива
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
import { exportFormToPdf, makePdfFileName } from 'extensions/reports/widgets/report-forms/pdf-export'

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
const pdfLoading = ref(false)
const previewRoot = ref<HTMLElement | null>(null)

const formComponent = computed<Component | undefined>(() => {
  const t = props.result?.reportType
  if (!t) return undefined
  return FORM_COMPONENTS[t]
})

// Формам всегда полезны реквизиты — шапка (ОКВЭД, адрес и т.п. — не все в XML)
const needsRequisites = computed(() => formComponent.value != null)

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

async function downloadPdf() {
  if (!props.result) return
  const root = previewRoot.value?.querySelector<HTMLElement>('.printable-form')
  if (!root) {
    FailAlert(new Error('Визуальная форма не отрендерилась'), 'Ошибка PDF')
    return
  }
  pdfLoading.value = true
  try {
    const name = makePdfFileName(
      props.result.reportType,
      props.result.year,
      props.result.period ?? null,
    )
    await exportFormToPdf(root, name)
  } catch (e) {
    FailAlert(e, 'Ошибка генерации PDF')
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
