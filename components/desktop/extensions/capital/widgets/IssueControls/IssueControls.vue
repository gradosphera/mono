<template lang="pug">
.row.items-center.q-gutter-md
  .col-auto
    UpdateStatus(
      v-if='issue'
      :model-value='issue.status'
      :issue-hash='issue.issue_hash'
      label='Статус'
      @update:modelValue='handleStatusUpdate'
    )
  .col-auto
    UpdatePriority(
      v-if='issue'
      :model-value='issue.priority'
      :issue-hash='issue.issue_hash'
      label='Приоритет'
      @update:modelValue='handlePriorityUpdate'
    )
  .col-auto
    UpdateEstimate(
      v-if='issue'
      :model-value='issue.estimate'
      :issue-hash='issue.issue_hash'
      label='Оценка (ч)'
      @update:modelValue='handleEstimateUpdate'
    )
</template>

<script setup lang="ts">
import { UpdateStatus, UpdatePriority, UpdateEstimate } from '../../features/Issue/UpdateIssue'

interface Props {
  issue: any // IIssue тип
}

interface Emits {
  (e: 'update:status', value: any): void
  (e: 'update:priority', value: any): void
  (e: 'update:estimate', value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleStatusUpdate = (value: any) => {
  emit('update:status', value)
}

const handlePriorityUpdate = (value: any) => {
  emit('update:priority', value)
}

const handleEstimateUpdate = (value: number) => {
  emit('update:estimate', value)
}
</script>
