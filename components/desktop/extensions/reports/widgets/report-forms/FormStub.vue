<template lang="pug">
.printable-form.form-stub
  section.page
    //- Угловые маркеры (штрихкод + ИНН/КПП) — как на официальных бланках
    .page__corner
      .barcode {{ '|| | |||| | |||' }}
      .kpp(v-if='header.kpp') КПП {{ header.kpp }}
      .inn-row
        .inn-label ИНН
        .inn-digits
          template(v-for='ch in padInn(header.inn)' :key='ch.idx')
            .inn-cell {{ ch.val }}

    .page__form-code
      | Форма по КНД
      br
      b {{ knd }}
      div.vers(v-if='versForm') ВерсФорм {{ versForm }}

    h1.page__title {{ title }}

    //- Базовые поля шапки, общие для всех форм ФНС
    .kv-row
      .kv-cell
        .kv-label Номер корректировки
        .kv-value 0--
      .kv-cell(v-if='period')
        .kv-label Отчётный период (код)
        .kv-value {{ period }}
      .kv-cell
        .kv-label Отчётный год
        .kv-value {{ year }}

    .kv-row
      .kv-cell.grow
        .kv-label Наименование организации
        .kv-value.name {{ header.orgName || '—' }}

    .kv-row
      .kv-cell
        .kv-label ОКВЭД2
        .kv-value {{ header.okved || '—' }}
      .kv-cell
        .kv-label ОКПО
        .kv-value {{ header.okpo || '—' }}
      .kv-cell
        .kv-label ОКТМО
        .kv-value {{ header.oktmo || '—' }}

    //- Placeholder с указанием на не-готовность формы и сырой XML
    .stub-banner
      q-icon(name='fa-solid fa-screwdriver-wrench' size='24px')
      .stub-text
        .stub-title Форма в разработке
        .stub-caption
          | Визуальное представление для
          b.q-mx-xs {{ title }}
          | ещё не свёрстано. Ниже — исходный XML отчёта.

    details.raw-xml(:open='false')
      summary Показать исходный XML
      pre.xml-body {{ xml }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IReportRequisitesView } from 'src/entities/Report'

/**
 * Базовая форма-заглушка: общая разметка шапки для всех «ещё не свёрстанных»
 * форм ФНС. Принимает те же пропсы, что и BuhotchForm, чтобы перевод формы
 * из stub в полноценную вёрстку сводился к замене содержимого Vue-компонента
 * без правок ReportPreviewDialog.
 */
const props = defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
  /** Полное название формы для заголовка (напр. «Декларация по УСН») */
  title: string
  /** КНД формы (напр. «1152017») */
  knd: string
  /** Версия формата (напр. «5.09»). Опционально — у ЕФС-1 нет. */
  versForm?: string
  /** Отчётный период (код), если применимо */
  period?: string | number
}>()

interface StubHeader {
  inn: string
  kpp: string
  orgName: string
  okved: string
  okpo: string
  oktmo: string
}

const header = computed<StubHeader>(() => {
  const empty: StubHeader = { inn: '', kpp: '', orgName: '', okved: '', okpo: '', oktmo: '' }

  // Пытаемся вытащить из XML (работает для ФНС-форматов со структурой <СвНП>/<НПЮЛ>)
  let h: StubHeader = empty
  if (props.xml) {
    try {
      const doc = new DOMParser().parseFromString(props.xml, 'text/xml')
      if (!doc.querySelector('parsererror')) {
        const get = (sel: string, attr: string) => doc.querySelector(sel)?.getAttribute(attr) ?? ''
        h = {
          inn: get('НПЮЛ', 'ИННЮЛ') || get('СвНП', 'ИНН'),
          kpp: get('НПЮЛ', 'КПП') || get('СвНП', 'КПП'),
          orgName: get('НПЮЛ', 'НаимОрг') || get('СвНП', 'НаимОрг'),
          okved: '',
          okpo: get('СвНП', 'ОКПО'),
          oktmo: '',
        }
      }
    } catch {
      // ignore, оставим empty → fallback на реквизиты
    }
  }

  // Fallback на реквизиты организации
  const r = props.requisites
  if (!r) return h
  const get = (key: keyof IReportRequisitesView): string => {
    const f = r[key] as { value?: string | null } | undefined
    return f?.value ?? ''
  }
  return {
    inn: h.inn || get('inn'),
    kpp: h.kpp || get('kpp'),
    orgName: h.orgName || get('orgName'),
    okved: h.okved || get('okved'),
    okpo: h.okpo || get('okpo'),
    oktmo: h.oktmo || get('oktmo'),
  }
})

function padInn(inn: string): { idx: number; val: string }[] {
  const chars = (inn || '').split('').slice(0, 12)
  const out: { idx: number; val: string }[] = []
  for (let i = 0; i < 12; i++) out.push({ idx: i, val: chars[i] ?? '' })
  return out
}
</script>

<style scoped lang="scss">
// Стили повторяют BuhotchForm — при выносе в общий scss оставить так, т.к.
// scoped-vue хэширует селекторы, shared-стили трогать опаснее.
.printable-form {
  font-family: 'Times New Roman', Times, serif;
  color: #000;
  background: #fff;
  font-size: 11pt;
  line-height: 1.25;

  .page {
    position: relative;
    background: #fff;
    box-sizing: border-box;
    width: 210mm;
    min-height: 297mm;
    padding: 15mm 15mm 15mm 20mm;
    margin: 0 auto 12px auto;
    border: 1px solid #111;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .page__corner {
    position: absolute;
    top: 10mm;
    left: 10mm;
    font-size: 9pt;
    line-height: 1.1;
    .barcode {
      font-family: 'Courier New', monospace;
      font-size: 14pt;
      letter-spacing: -1px;
      margin-bottom: 2mm;
    }
    .kpp { margin-bottom: 1mm; }
    .inn-row {
      display: flex;
      align-items: center;
      gap: 2mm;
      .inn-digits { display: flex; }
      .inn-cell {
        width: 4mm;
        height: 5mm;
        border: 0.5pt solid #000;
        border-right: 0;
        text-align: center;
        font-size: 10pt;
        &:last-child { border-right: 0.5pt solid #000; }
      }
    }
  }

  .page__form-code {
    position: absolute;
    top: 10mm;
    right: 15mm;
    width: 40mm;
    text-align: center;
    border: 0.5pt solid #000;
    padding: 2mm 1mm;
    font-size: 9pt;
    b { font-size: 12pt; }
    .vers { font-size: 8pt; margin-top: 1mm; }
  }

  .page__title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 20mm 0 6mm 0;
  }

  .kv-row { display: flex; gap: 2mm; margin-bottom: 3mm; }

  .kv-cell {
    flex: 1;
    border: 0.5pt solid #000;
    padding: 1mm 2mm 1.5mm 2mm;
    min-height: 10mm;
    &.grow { flex: 3; }
    .kv-label { font-size: 8pt; color: #333; margin-bottom: 0.5mm; }
    .kv-value { font-size: 11pt; &.name { font-weight: 500; } }
  }

  .stub-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff4e0;
    border: 1px dashed #d08f3a;
    padding: 10px 14px;
    margin: 10mm 0 5mm 0;
    color: #704a1a;
    .stub-title { font-weight: bold; font-size: 11pt; }
    .stub-caption { font-size: 10pt; }
  }

  .raw-xml {
    margin-top: 4mm;
    summary {
      cursor: pointer;
      font-size: 9pt;
      color: #555;
      user-select: none;
    }
    .xml-body {
      margin-top: 2mm;
      max-height: 200mm;
      overflow: auto;
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      background: #f7f7f9;
      padding: 6px;
      border: 0.5pt solid #ccc;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

@media print {
  .printable-form .page {
    box-shadow: none;
    margin: 0;
    page-break-after: always;
  }
}
</style>
