<template lang="pug">
div
  UpdateStatus(
    v-if='issue'
    :model-value='issue.status'
    :issue-hash='issue.issue_hash'
    label='Статус'
    :readonly='!permissions?.can_change_status'
    :allowed-transitions='(permissions)?.allowed_status_transitions'
    @update:modelValue='handleStatusUpdate'
  ).full-width.q-mb-sm

  SetCreatorButton(
    v-if='issue'
    :issue='issue'
    :dense='true'
    :permissions='permissions'
    @creators-set='handleCreatorsSet'
    @issue-updated='handleIssueUpdated'
  ).full-width.q-mb-sm

  UpdatePriority(
    v-if='issue'
    :model-value='issue.priority'
    :issue-hash='issue.issue_hash'
    label='Приоритет'
    :readonly='!permissions?.can_set_priority'
    @update:modelValue='handlePriorityUpdate'
  ).full-width.q-mb-sm

  UpdateEstimate(
    v-if='issue'
    :model-value='issue.estimate'
    :issue-hash='issue.issue_hash'
    label='Оценка (ч)'
    :readonly='!permissions?.can_set_estimate'
    @update:modelValue='handleEstimateUpdate'
  ).full-width.q-mb-sm


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
  (e: 'issue-updated', issue: any): void
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

const handleIssueUpdated = (issue: any) => {
  emit('issue-updated', issue)
}
</script>
