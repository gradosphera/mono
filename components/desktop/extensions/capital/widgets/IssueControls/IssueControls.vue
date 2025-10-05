<template lang="pug">
.row.items-center.q-gutter-md
  .col-auto
    UpdateStatus(
      v-if='issue'
      :model-value='issue.status'
      :issue-hash='issue.issue_hash'
      label='Статус'
      :readonly='!permissions?.can_change_status'
      @update:modelValue='handleStatusUpdate'
    )
  .col-auto
    UpdatePriority(
      v-if='issue'
      :model-value='issue.priority'
      :issue-hash='issue.issue_hash'
      label='Приоритет'
      :readonly='!permissions?.can_edit_issue'
      @update:modelValue='handlePriorityUpdate'
    )
  .col-auto
    UpdateEstimate(
      v-if='issue'
      :model-value='issue.estimate'
      :issue-hash='issue.issue_hash'
      label='Оценка (ч)'
      :readonly='!permissions?.can_edit_issue'
      @update:modelValue='handleEstimateUpdate'
    )
  .col-auto

    SetCreatorButton(
      v-if='issue'
      :issue='issue'
      :dense='true'
      :disable='!permissions?.can_edit_issue'
      @creators-set='handleCreatorsSet'
    )
</template>

<script setup lang="ts">
import type { IIssuePermissions } from 'app/extensions/capital/entities/Issue/model'
import { UpdateStatus, UpdatePriority, UpdateEstimate } from '../../features/Issue/UpdateIssue'
import { SetCreatorButton } from '../../features/Issue/SetCreator'

interface Props {
  issue: any // IIssue тип
  permissions?: IIssuePermissions | null
}

interface Emits {
  (e: 'update:status', value: any): void
  (e: 'update:priority', value: any): void
  (e: 'update:estimate', value: number): void
  (e: 'creators-set', creators: any[]): void
}

withDefaults(defineProps<Props>(), {
  permissions: null
})
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

const handleCreatorsSet = (creators: any[]) => {
  emit('creators-set', creators)
}
</script>
