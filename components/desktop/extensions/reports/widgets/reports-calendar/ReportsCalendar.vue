<template lang="pug">
.reports-calendar
  .calendar-header
    .row.items-center.q-gutter-sm
      .text-subtitle2.col Календарь отчётности {{ year }} год
      q-btn-group(flat dense)
        q-btn(
          flat dense
          icon='fa-solid fa-angle-left'
          @click='changeYear(-1)'
          aria-label='Предыдущий год'
        )
          q-tooltip Предыдущий год
        q-btn(
          flat dense
          :label='String(year)'
          @click='resetYear'
        )
          q-tooltip Текущий год
        q-btn(
          flat dense
          icon='fa-solid fa-angle-right'
          @click='changeYear(1)'
          aria-label='Следующий год'
        )
          q-tooltip Следующий год
      q-btn(flat dense icon='fa-solid fa-rotate' @click='reload' :loading='loading')
        q-tooltip Обновить

  q-inner-loading(:showing='loading')
    q-spinner(size='40px' color='primary')

  .calendar-grid(v-if='rows.length')
    .ch-corner
    .ch-month(v-for='(m, i) in MONTH_LABELS' :key='i') {{ m }}

    template(v-for='row in rows' :key='row.reportType')
      .cell-name
        .rt-short {{ row.shortName }}
        .rt-kind {{ kindLabel(row.periodKind) }}

      template(v-for='month in 12' :key='month')
        CalendarCell(
          :row='row'
          :month='month'
          :entry='periodAtMonth(row, month)'
          @click='onCellClick(row, month)'
        )

  .empty-state(v-else-if='!loading')
    q-icon(name='fa-solid fa-calendar-xmark' size='32px' color='grey-5')
    .text-caption.q-mt-sm Нет данных по формам
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FailAlert } from 'src/shared/api'
import {
  useReportStore,
  type IReportCalendarRow,
  type IReportCalendarPeriodEntry,
  type IReportType,
} from 'src/entities/Report'
import CalendarCell from './CalendarCell.vue'

const MONTH_LABELS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]

const reportStore = useReportStore()

const emit = defineEmits<{
  (e: 'select', payload: { reportType: IReportType; year: number; period: number | null }): void
}>()

const year = ref(new Date().getFullYear())
const rows = ref<IReportCalendarRow[]>([])
const loading = ref(false)

async function reload(): Promise<void> {
  loading.value = true
  try {
    rows.value = await reportStore.loadCalendar(year.value)
  } catch (e) {
    FailAlert(e, 'Ошибка загрузки календаря')
  } finally {
    loading.value = false
  }
}

function changeYear(delta: number): void {
  year.value += delta
}

function resetYear(): void {
  year.value = new Date().getFullYear()
}

watch(year, () => void reload())
onMounted(() => void reload())

function periodAtMonth(row: IReportCalendarRow, month: number): IReportCalendarPeriodEntry | undefined {
  return row.periods.find((p) => p.dueMonth === month)
}

function kindLabel(kind: string): string {
  return ({ yearly: 'годовая', quarterly: 'квартальная', monthly: 'ежемесячная' }[kind] ?? kind)
}

function onCellClick(row: IReportCalendarRow, month: number): void {
  const entry = periodAtMonth(row, month)
  if (!entry) return
  // reportYear в календаре — это год «ЗА который» отчитываемся, он совпадает
  // с текущим year виджета (dueMonth/dueYearOffset учитываются только для UI).
  emit('select', {
    reportType: row.reportType as IReportType,
    year: year.value,
    period: entry.periodCode ?? null,
  })
}

// Экспонируем reload() для родителя: после закрытия редактора / постановки
// mark'а нужно обновить rows, иначе статус ячейки обновится только при
// ре-маунте страницы (переход между табами и обратно).
defineExpose({ reload })
</script>

<style scoped lang="scss">
.reports-calendar {
  position: relative;
  font-size: 13px;
}

.calendar-header {
  margin-bottom: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 180px repeat(12, 1fr);
  gap: 2px;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px;
}

.ch-corner {
  background: #f5f5f5;
}

.ch-month {
  background: #f5f5f5;
  padding: 8px 4px;
  text-align: center;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  color: #555;
}

.cell-name {
  background: #fafafa;
  padding: 8px 10px;
  border-top: 1px solid #eee;
  .rt-short {
    font-weight: 600;
    color: #222;
  }
  .rt-kind {
    font-size: 11px;
    color: #999;
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
