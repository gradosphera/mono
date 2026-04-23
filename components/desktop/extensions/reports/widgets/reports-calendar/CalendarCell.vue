<template lang="pug">
.cell-month(:class='classes' @click='onClick')
  .cell-inner(v-if='entry')
    .ci-label {{ entry.label }}
    q-icon.ci-icon(:name='statusIcon(entry.status)')
    q-tooltip {{ tooltip }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IReportCalendarPeriodEntry, IReportCalendarRow } from 'src/entities/Report'

const props = defineProps<{
  row: IReportCalendarRow
  month: number
  entry: IReportCalendarPeriodEntry | undefined
}>()

const emit = defineEmits<(e: 'click') => void>()

const classes = computed<Record<string, boolean>>(() => ({
  active: !!props.entry,
  [`status-${props.entry?.status ?? 'empty'}`]: !!props.entry,
}))

const tooltip = computed(() => {
  if (!props.entry) return ''
  const statusRu: Record<string, string> = {
    submitted: 'Сдан',
    draft: 'Черновик',
    overdue: 'Просрочен',
    empty: 'Не сдан',
  }
  const s = statusRu[props.entry.status] ?? props.entry.status
  return `${props.row.shortName}: ${props.entry.label}\nСрок: ${props.entry.dueDate}\nСтатус: ${s}`
})

function statusIcon(status: string): string {
  switch (status) {
    case 'submitted': return 'fa-solid fa-circle-check'
    case 'draft': return 'fa-solid fa-pen'
    case 'overdue': return 'fa-solid fa-triangle-exclamation'
    default: return 'fa-solid fa-circle'
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
    padding: 4px;
    border-radius: 4px;
  }
  .ci-label {
    font-size: 10px;
    line-height: 1;
  }
  .ci-icon {
    font-size: 14px;
  }

  &.active {
    cursor: pointer;
    &:hover { background: #e3f2fd; }
  }

  &.status-submitted .cell-inner { color: #2e7d32; background: #e8f5e9; }
  &.status-draft .cell-inner { color: #ef6c00; background: #fff3e0; }
  &.status-overdue .cell-inner { color: #c62828; background: #ffebee; }
  &.status-empty .cell-inner { color: #546e7a; background: #eceff1; }
}
</style>
