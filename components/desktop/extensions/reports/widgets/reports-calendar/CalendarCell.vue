<template lang="pug">
.cell-month(:class='classes' @click='onClick')
  .cell-inner(v-if='entry')
    .ci-label {{ entry.label }}
    //- Для submitted — кружок-точка (зелёный dot), не заливаем фон агрессивным.
    //- Для остальных статусов — семантическая иконка, фон красится через класс.
    span.ci-dot(v-if='entry.status === SUBMITTED')
    q-icon.ci-icon(v-else :name='statusIcon(entry.status)')
    q-tooltip {{ tooltip }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Zeus } from '@coopenomics/sdk'
import type { IReportCalendarPeriodEntry, IReportCalendarRow } from 'src/entities/Report'

const props = defineProps<{
  row: IReportCalendarRow
  month: number
  entry: IReportCalendarPeriodEntry | undefined
}>()

const emit = defineEmits<(e: 'click') => void>()

// wire-значения enum'а — на шине GraphQL KEYS uppercase (Zeus так типизирует).
// Zeus-литерал: защищённый источник правды при регенерации SDK.
const SUBMITTED = Zeus.CalendarEntryStatus.SUBMITTED

// Для CSS-класса и словаря подписей используем строковое представление
// status как есть (`DRAFT`/`OVERDUE`/`NOT_REQUIRED`/`EMPTY`/`SUBMITTED`).
const classes = computed<Record<string, boolean>>(() => ({
  active: !!props.entry,
  [`status-${props.entry?.status ?? 'EMPTY'}`]: !!props.entry,
}))

const STATUS_RU: Record<string, string> = {
  [Zeus.CalendarEntryStatus.SUBMITTED]: 'Сдан',
  [Zeus.CalendarEntryStatus.DRAFT]: 'Черновик',
  [Zeus.CalendarEntryStatus.OVERDUE]: 'Просрочен',
  [Zeus.CalendarEntryStatus.NOT_REQUIRED]: 'Не надо сдавать',
  [Zeus.CalendarEntryStatus.EMPTY]: 'Не сдан',
}

const tooltip = computed(() => {
  if (!props.entry) return ''
  const s = STATUS_RU[props.entry.status] ?? props.entry.status
  return `${props.row.shortName}: ${props.entry.label}\nСрок: ${props.entry.dueDate}\nСтатус: ${s}`
})

function statusIcon(status: string): string {
  switch (status) {
    case Zeus.CalendarEntryStatus.DRAFT: return 'fa-solid fa-pen'
    case Zeus.CalendarEntryStatus.OVERDUE: return 'fa-solid fa-triangle-exclamation'
    case Zeus.CalendarEntryStatus.NOT_REQUIRED: return 'fa-solid fa-circle-xmark'
    default: return 'fa-regular fa-circle'
  }
}

function onClick() {
  if (props.entry) emit('click')
}
</script>

<style scoped lang="scss">
.cell-month {
  background: #fff;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  transition: background 0.15s;

  .cell-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 4px 6px;
    border-radius: 4px;
    min-width: 48px;
  }
  .ci-label {
    font-size: 10px;
    line-height: 1;
  }
  .ci-icon {
    font-size: 14px;
  }
  .ci-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #2e7d32;
    box-shadow: 0 0 0 2px #c8e6c9;
  }

  &.active {
    cursor: pointer;
    &:hover { background: #e3f2fd; }
  }

  // Submitted: фон не заливаем. Только зелёная точка внутри — как в СБИС/Контуре.
  &.status-SUBMITTED .cell-inner {
    color: #1b5e20;
    background: transparent;
  }

  // Draft: мягкий оранжевый, сигнал «в работе».
  &.status-DRAFT .cell-inner {
    color: #ef6c00;
    background: #fff3e0;
  }

  // Overdue (не сдан + срок прошёл) — насыщенный красный fill, видно издалека.
  &.status-OVERDUE .cell-inner {
    color: #fff;
    background: #c62828;
    font-weight: 600;
  }
  &.status-OVERDUE .ci-icon {
    color: #fff;
  }

  // Not required: нейтральный серый, чтобы не кричал. Клик всё ещё открывает диалог
  // (можно снять отметку).
  &.status-NOT_REQUIRED .cell-inner {
    color: #546e7a;
    background: #eceff1;
    opacity: 0.75;
  }

  // Empty (период будущий/активный, отчёт ещё не нужен) — нейтрально.
  &.status-EMPTY .cell-inner {
    color: #546e7a;
    background: #f5f7fa;
  }
}
</style>
