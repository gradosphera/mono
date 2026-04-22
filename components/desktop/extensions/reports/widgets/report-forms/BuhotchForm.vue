<template lang="pug">
.printable-form.buhotch-form
  //- === Лист 1. Титульный ===
  section.page
    .page__corner
      .barcode {{ '|| | |||| |||| | |||' }}
      .kpp(v-if='header.kpp') КПП {{ header.kpp }}
      .inn-row
        .inn-label ИНН
        .inn-digits
          template(v-for='ch in padInn(header.inn)' :key='ch.idx')
            .inn-cell {{ ch.val }}
    .page__form-code
      | Форма по КНД
      br
      b 0710096
    h1.page__title Упрощённая бухгалтерская (финансовая) отчётность

    .kv-row
      .kv-cell
        .kv-label Номер корректировки
        .kv-value {{ header.correctionNumber || '0--' }}
      .kv-cell
        .kv-label Отчётный период (код)
        .kv-value {{ header.period || '91' }}
      .kv-cell
        .kv-label Отчётный год
        .kv-value {{ header.year }}

    .kv-row
      .kv-cell.grow
        .kv-label Предоставляется в налоговый орган (код)
        .kv-value —

    .kv-row
      .kv-cell.grow
        .kv-label Наименование организации
        .kv-value.name {{ header.orgName || '—' }}

    .kv-row
      .kv-cell
        .kv-label Код вида деятельности (ОКВЭД2)
        .kv-value {{ header.okved || '—' }}
      .kv-cell
        .kv-label ОКПО
        .kv-value {{ header.okpo || '—' }}
      .kv-cell
        .kv-label Форма собственности (ОКФС)
        .kv-value {{ header.okfs || '—' }}
      .kv-cell
        .kv-label Организационно-правовая форма (ОКОПФ)
        .kv-value {{ header.okopf || '—' }}

    .kv-row
      .kv-cell.narrow
        .kv-label Единица измерения
        .kv-value тыс. ₽ (код ОКЕИ {{ header.okei || '384' }})

    .kv-row
      .kv-cell.grow
        .kv-label Местонахождение (адрес)
        .kv-value {{ header.address || '—' }}

    .signer-block
      .kv-row
        .kv-cell
          .kv-label Достоверность и полноту подтверждает
          .kv-value
            span(v-if='header.signerType === "chairman"') 1 — руководитель
            span(v-else) 2 — представитель
        .kv-cell.grow
          .kv-label Фамилия, имя, отчество
          .kv-value {{ fullSignerName || '—' }}
      .kv-row(v-if='header.signerType === "representative"')
        .kv-cell.grow
          .kv-label Документ подтверждающий полномочия
          .kv-value {{ header.signerRepDoc || '—' }}

    .signature-line
      .sig-col.signature
        .sig-label Подпись
        .sig-blank _______________________
      .sig-col.date
        .sig-label Дата
        .sig-blank {{ formatDate(header.docDate) }}

  //- === Лист 2. Бухгалтерский баланс (0710001) ===
  section.page
    .page__corner
      .barcode {{ '|| |||| | ||| | ||||' }}
      .kpp(v-if='header.kpp') КПП {{ header.kpp }}
      .inn-row
        .inn-label ИНН
        .inn-digits
          template(v-for='ch in padInn(header.inn)' :key='ch.idx')
            .inn-cell {{ ch.val }}
    .page__form-code
      | Форма по ОКУД
      br
      b 0710001
    h2.page__title-2 Бухгалтерский баланс

    table.balance
      thead
        tr
          th.col-name Наименование показателя
          th.col-code Код
          th.col-val На {{ dec31(header.year) }}
          th.col-val На 31 декабря {{ header.year - 1 }} г.
          th.col-val На 31 декабря {{ header.year - 2 }} г.
      tbody
        tr.section-title
          td(colspan='5') АКТИВ
        tr
          td Материальные внеоборотные активы
          td.code 1150-М
          td.num —
          td.num —
          td.num —
        tr
          td Нематериальные, финансовые и другие внеоборотные активы
          td.code 1170
          td.num {{ fmt(balance.asset.nonMatFin?.otch) }}
          td.num {{ fmt(balance.asset.nonMatFin?.prdPrev) }}
          td.num {{ fmt(balance.asset.nonMatFin?.prdPrePrev) }}
        tr
          td Запасы
          td.code 1210
          td.num —
          td.num —
          td.num —
        tr
          td Денежные средства и денежные эквиваленты
          td.code 1250
          td.num {{ fmt(balance.asset.cash?.otch) }}
          td.num {{ fmt(balance.asset.cash?.prdPrev) }}
          td.num {{ fmt(balance.asset.cash?.prdPrePrev) }}
        tr
          td Финансовые и другие оборотные активы
          td.code 1260
          td.num {{ fmt(balance.asset.finInv?.otch) }}
          td.num {{ fmt(balance.asset.finInv?.prdPrev) }}
          td.num {{ fmt(balance.asset.finInv?.prdPrePrev) }}
        tr.total
          td БАЛАНС
          td.code 1600
          td.num {{ fmt(balance.asset.total?.otch) }}
          td.num {{ fmt(balance.asset.total?.prdPrev) }}
          td.num {{ fmt(balance.asset.total?.prdPrePrev) }}

        tr.section-title
          td(colspan='5') ПАССИВ
        tr
          td Капитал и резервы
          td.code 1300
          td.num —
          td.num —
          td.num —
        tr
          td Целевые средства (паевой фонд + целевые поступления)
          td.code 1350
          td.num {{ fmt(balance.passive.target?.otch) }}
          td.num {{ fmt(balance.passive.target?.prdPrev) }}
          td.num {{ fmt(balance.passive.target?.prdPrePrev) }}
        tr
          td Долгосрочные заёмные средства
          td.code 1410
          td.num —
          td.num —
          td.num —
        tr
          td Краткосрочные заёмные средства
          td.code 1510
          td.num —
          td.num —
          td.num —
        tr
          td Кредиторская задолженность
          td.code 1520
          td.num —
          td.num —
          td.num —
        tr.total
          td БАЛАНС
          td.code 1700
          td.num {{ fmt(balance.passive.total?.otch) }}
          td.num {{ fmt(balance.passive.total?.prdPrev) }}
          td.num {{ fmt(balance.passive.total?.prdPrePrev) }}

    .note-below-balance(v-if='balanceDelta !== null')
      span(v-if='Math.abs(balanceDelta) <= 1') Актив равен пассиву (расхождение {{ balanceDelta }} тыс. ₽ — в пределах нормы округления)
      span.warn(v-else) ⚠️ Актив не равен пассиву: Δ = {{ balanceDelta }} тыс. ₽

    .signature-line
      .sig-col.signature
        .sig-label Руководитель
        .sig-blank {{ fullSignerName || '_______________________' }}
      .sig-col.date
        .sig-label Дата
        .sig-blank {{ formatDate(header.docDate) }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IReportRequisitesView } from 'src/entities/Report'

interface BalanceRow {
  otch: number
  prdPrev: number
  prdPrePrev: number
}

interface ParsedBalance {
  asset: {
    nonMatFin?: BalanceRow
    cash?: BalanceRow
    finInv?: BalanceRow
    total?: BalanceRow
  }
  passive: {
    target?: BalanceRow
    total?: BalanceRow
  }
}

interface ParsedHeader {
  inn: string
  kpp: string
  orgName: string
  address: string
  okpo: string
  okfs: string
  okopf: string
  okved: string
  okei: string
  period: string
  year: number
  correctionNumber: string
  docDate: string
  signerType: 'chairman' | 'representative'
  signerLastName: string
  signerFirstName: string
  signerMiddleName: string
  signerRepDoc: string
}

const props = defineProps<{
  xml: string
  requisites?: IReportRequisitesView | null
  year?: number
}>()

/**
 * Парсим XML отчёта buhotch через DOMParser (браузерная среда). Для полей,
 * которых нет в XML (ОКВЭД, etc. — генератор их не выводит), fallback-ом
 * берём реквизиты через `requisites`.
 */
const parsed = computed<{ header: ParsedHeader; balance: ParsedBalance }>(() => {
  const empty: ParsedHeader = {
    inn: '', kpp: '', orgName: '', address: '',
    okpo: '', okfs: '', okopf: '', okved: '',
    okei: '384', period: '91',
    year: props.year ?? new Date().getFullYear(),
    correctionNumber: '0',
    docDate: '',
    signerType: 'chairman',
    signerLastName: '', signerFirstName: '', signerMiddleName: '',
    signerRepDoc: '',
  }
  const balance: ParsedBalance = { asset: {}, passive: {} }

  if (!props.xml) return { header: withRequisites(empty), balance }

  let doc: Document
  try {
    doc = new DOMParser().parseFromString(props.xml, 'text/xml')
  } catch {
    return { header: withRequisites(empty), balance }
  }
  if (doc.querySelector('parsererror')) {
    return { header: withRequisites(empty), balance }
  }

  const getAttr = (sel: string, attr: string): string => {
    const el = doc.querySelector(sel)
    return el?.getAttribute(attr) ?? ''
  }
  const getNum = (sel: string, attr: string): number => {
    const v = getAttr(sel, attr)
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const header: ParsedHeader = {
    inn: getAttr('НПЮЛ', 'ИННЮЛ'),
    kpp: getAttr('НПЮЛ', 'КПП'),
    orgName: getAttr('НПЮЛ', 'НаимОрг'),
    address: getAttr('НПЮЛ', 'АдрМН'),
    okpo: getAttr('СвНП', 'ОКПО'),
    okfs: getAttr('СвНП', 'ОКФС'),
    okopf: getAttr('СвНП', 'ОКОПФ'),
    okved: '', // не в XML
    okei: getAttr('Документ', 'ОКЕИ') || '384',
    period: getAttr('Документ', 'Период') || '91',
    year: Number(getAttr('Документ', 'ОтчетГод')) || (props.year ?? new Date().getFullYear()),
    correctionNumber: getAttr('Документ', 'НомКорр') || '0',
    docDate: getAttr('Документ', 'ДатаДок'),
    signerType: getAttr('Подписант', 'ПрПодп') === '2' ? 'representative' : 'chairman',
    signerLastName: getAttr('Подписант ФИО', 'Фамилия'),
    signerFirstName: getAttr('Подписант ФИО', 'Имя'),
    signerMiddleName: getAttr('Подписант ФИО', 'Отчество'),
    signerRepDoc: getAttr('Подписант СвПред', 'НаимДок'),
  }

  const readRow = (sel: string): BalanceRow => ({
    otch: getNum(sel, 'СумОтч'),
    prdPrev: getNum(sel, 'СумПрдщ'),
    prdPrePrev: getNum(sel, 'СумПрдшв'),
  })

  if (doc.querySelector('Актив')) {
    balance.asset.total = readRow('Актив')
    if (doc.querySelector('Актив НеМатФинАкт')) balance.asset.nonMatFin = readRow('Актив НеМатФинАкт')
    if (doc.querySelector('Актив ДенежнСр'))    balance.asset.cash      = readRow('Актив ДенежнСр')
    if (doc.querySelector('Актив ФинВлож'))     balance.asset.finInv    = readRow('Актив ФинВлож')
  }
  if (doc.querySelector('Пассив')) {
    balance.passive.total = readRow('Пассив')
    if (doc.querySelector('Пассив ЦелевСредства')) balance.passive.target = readRow('Пассив ЦелевСредства')
  }

  return { header: withRequisites(header), balance }
})

function withRequisites(h: ParsedHeader): ParsedHeader {
  const r = props.requisites
  if (!r) return h
  const get = (key: keyof IReportRequisitesView): string => {
    const f = r[key] as { value?: string | null } | undefined
    return f?.value ?? ''
  }
  return {
    ...h,
    inn: h.inn || get('inn'),
    kpp: h.kpp || get('kpp'),
    orgName: h.orgName || get('orgName'),
    address: h.address || get('address'),
    okpo: h.okpo || get('okpo'),
    okfs: h.okfs || get('okfs'),
    okopf: h.okopf || get('okopf'),
    okved: h.okved || get('okved'),
    signerLastName: h.signerLastName || get('signerLastName'),
    signerFirstName: h.signerFirstName || get('signerFirstName'),
    signerMiddleName: h.signerMiddleName || get('signerMiddleName'),
  }
}

const header = computed(() => parsed.value.header)
const balance = computed(() => parsed.value.balance)

const fullSignerName = computed(() => {
  const h = header.value
  return [h.signerLastName, h.signerFirstName, h.signerMiddleName].filter(Boolean).join(' ')
})

const balanceDelta = computed(() => {
  const a = balance.value.asset.total?.otch
  const p = balance.value.passive.total?.otch
  if (a == null || p == null) return null
  return a - p
})

function fmt(n?: number): string {
  if (n == null || n === 0) return '—'
  return new Intl.NumberFormat('ru-RU').format(n)
}

/**
 * Добивает ИНН пустыми ячейками до 12 символов (как на типографском бланке).
 * 10-значный ИНН юрлица — первые 10 ячеек заполнены, последние 2 пусты.
 */
function padInn(inn: string): { idx: number; val: string }[] {
  const chars = (inn || '').split('').slice(0, 12)
  const out: { idx: number; val: string }[] = []
  for (let i = 0; i < 12; i++) out.push({ idx: i, val: chars[i] ?? '' })
  return out
}

function dec31(year: number): string {
  return `31 декабря ${year} г.`
}

function formatDate(s: string): string {
  if (!s) return ''
  // XML дата формата YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (m) return `${m[3]}.${m[2]}.${m[1]}`
  return s
}
</script>

<style scoped lang="scss">
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

    & + .page { margin-top: 16px; }
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
  }

  .page__title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 20mm 0 6mm 0;
  }

  .page__title-2 {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    margin: 22mm 0 6mm 0;
  }

  .kv-row {
    display: flex;
    gap: 2mm;
    margin-bottom: 3mm;
  }

  .kv-cell {
    flex: 1;
    border: 0.5pt solid #000;
    padding: 1mm 2mm 1.5mm 2mm;
    min-height: 10mm;
    background: #fff;

    &.grow { flex: 3; }
    &.narrow { flex: 0 0 60mm; }

    .kv-label {
      font-size: 8pt;
      color: #333;
      margin-bottom: 0.5mm;
    }

    .kv-value {
      font-size: 11pt;
      &.name { font-weight: 500; }
    }
  }

  .signer-block {
    margin-top: 5mm;
    padding-top: 3mm;
    border-top: 0.5pt dashed #000;
  }

  .signature-line {
    display: flex;
    gap: 10mm;
    margin-top: 8mm;
    .sig-col { flex: 1; }
    .sig-col.date { flex: 0 0 50mm; }
    .sig-label {
      font-size: 9pt;
      margin-bottom: 1mm;
      border-bottom: 0.5pt solid #000;
      padding-bottom: 1mm;
    }
    .sig-blank {
      margin-top: 2mm;
      font-size: 10pt;
      min-height: 7mm;
    }
  }

  table.balance {
    width: 100%;
    border-collapse: collapse;
    margin-top: 3mm;
    font-size: 10pt;

    th, td {
      border: 0.5pt solid #000;
      padding: 1.2mm 2mm;
      vertical-align: middle;
    }

    th {
      font-weight: bold;
      background: #f5f5f5;
      text-align: center;
      font-size: 9pt;
    }

    .col-name { width: 45%; text-align: left; }
    .col-code { width: 10%; text-align: center; }
    .col-val  { width: 15%; text-align: right; }

    td.code { text-align: center; font-family: 'Courier New', monospace; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }

    tr.section-title td {
      background: #eee;
      font-weight: bold;
      text-align: left;
      padding: 2mm;
    }

    tr.total td {
      font-weight: bold;
      background: #fafafa;
    }
  }

  .note-below-balance {
    margin-top: 4mm;
    font-size: 9pt;
    font-style: italic;
    color: #444;
    .warn { color: #a00; font-weight: bold; font-style: normal; }
  }
}

@media print {
  .printable-form {
    .page {
      box-shadow: none;
      margin: 0;
      page-break-after: always;
    }
  }
}
</style>
