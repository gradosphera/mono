<template lang="pug">
div.q-pa-md
  // Редактор названия задачи
  IssueTitleEditor(
    :issue='issue'
    @field-change="handleFieldChange"
    @update:title="handleTitleUpdate"
  ).full-width
    template(#prepend-icon)
      q-icon(name='task', size='24px', color='primary')

  // Путь к родительскому проекту/компоненту
  ProjectPathWidget(
    v-if="parentProject"
    :project="parentProject"
  )
  // Элементы управления задачей
  IssueControls(
    :issue='issue'
    :permissions='permissions'
    @update:status='handleStatusUpdate'
    @update:priority='handlePriorityUpdate'
    @update:estimate='handleEstimateUpdate'
    @creators-set='handleCreatorsSet'
    @issue-updated='handleIssueUpdated'
  ).q-mb-md.full-width



  // Требования к задаче (только для десктопа)
  StoriesWidget(
    v-if="issue && !isMobile"
    :filter="storiesFilter"
    canCreate
    :maxItems="20"
    emptyMessage="Требований к задаче пока нет"
  ).q-mt-md
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { IIssue, IIssuePermissions } from 'app/extensions/capital/entities/Issue/model'
import { IssueTitleEditor, IssueControls, ProjectPathWidget, StoriesWidget } from 'app/extensions/capital/widgets'
import { useWindowSize } from 'src/shared/hooks/useWindowSize'

const { isMobile } = useWindowSize()

interface Props {
  issue: IIssue | null | undefined
  permissions?: IIssuePermissions | null
  parentProject?: any
}

const props = defineProps<Props>()

// Фильтр для StoriesWidget
const storiesFilter = computed(() => {
  if (!props.issue) return {}
  return {
    issue_hash: props.issue.issue_hash,
    project_hash: props.issue.project_hash
  }
})

const emit = defineEmits<{
  fieldChange: []
  'update:title': [value: string]
  'update:status': [value: any]
  'update:priority': [value: any]
  'update:estimate': [value: number]
  'creators-set': [creators: any[]]
  'issue-updated': [issue: any]
}>()

// Используем ProjectPathWidget для отображения пути к родительскому элементу

// Обработчик изменения полей
const handleFieldChange = () => {
  emit('fieldChange')
}

// Обработчик обновления названия задачи
const handleTitleUpdate = (value: string) => {
  emit('update:title', value)
}

// Обработчики для IssueControls
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

<style lang="scss" scoped>
</style>
