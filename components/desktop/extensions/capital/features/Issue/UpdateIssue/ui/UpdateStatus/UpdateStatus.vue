<template lang="pug">
q-select(
  ref="selectRef"
  v-model="selectedStatus"
  :options="statusOptions"
  option-value="value"
  option-label="label"
  emit-value
  map-options
  :color="getIssueStatusColor(selectedStatus)"
  text-color="white"
  :bg-color="statusBgColor"
  dense
  :standout="statusStandout"
  :label="label"
  :readonly="readonly"
  @click="handleClick"
  @update:model-value="handleStatusChange"
)
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Zeus } from '@coopenomics/sdk'

import { useUpdateIssue } from '../../model'
import { getIssueStatusColor, getIssueStatusLabel } from 'app/extensions/capital/shared/lib'

interface Props {
  modelValue: Zeus.IssueStatus
  issueHash: string
  label?: string
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Zeus.IssueStatus): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Статус',
  readonly: false
})

const emit = defineEmits<Emits>()

const route = useRoute()
const projectHash = computed(() => route.params.project_hash as string)

// Ref для доступа к q-select компоненту
const selectRef = ref()

// Используем composable для обновления задач
const { debounceSave } = useUpdateIssue()

// Текущий выбранный статус
const selectedStatus = ref<Zeus.IssueStatus>(props.modelValue)

// Computed свойство для standout в зависимости от статуса
const statusStandout = computed(() => {
  const color = getIssueStatusColor(selectedStatus.value)
  return `bg-${color} text-white`
})

// Computed свойство для bg-color в зависимости от статуса
const statusBgColor = computed(() => getIssueStatusColor(selectedStatus.value))

// Опции для выбора статуса
const statusOptions = [
  { value: Zeus.IssueStatus.BACKLOG, label: getIssueStatusLabel(Zeus.IssueStatus.BACKLOG) },
  { value: Zeus.IssueStatus.TODO, label: getIssueStatusLabel(Zeus.IssueStatus.TODO) },
  { value: Zeus.IssueStatus.IN_PROGRESS, label: getIssueStatusLabel(Zeus.IssueStatus.IN_PROGRESS) },
  { value: Zeus.IssueStatus.ON_REVIEW, label: getIssueStatusLabel(Zeus.IssueStatus.ON_REVIEW) },
  { value: Zeus.IssueStatus.DONE, label: getIssueStatusLabel(Zeus.IssueStatus.DONE) },
  { value: Zeus.IssueStatus.CANCELED, label: getIssueStatusLabel(Zeus.IssueStatus.CANCELED) },
]

// Обработчик клика по селекту - переключает dropdown
const handleClick = () => {
  if (!props.readonly && selectRef.value) {
    selectRef.value.togglePopup()
  }
}

// Обработчик изменения статуса
const handleStatusChange = async (newStatus: Zeus.IssueStatus) => {
  if (!newStatus || newStatus === props.modelValue) return

  try {
    const updateData = {
      issue_hash: props.issueHash,
      status: newStatus,
    }

    // Автоматическое сохранение с задержкой
    debounceSave(updateData, projectHash.value)

    // Обновляем локальное значение
    emit('update:modelValue', newStatus)
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}

// Синхронизируем с внешним значением
watch(() => props.modelValue, (newValue) => {
  selectedStatus.value = newValue
})
</script>
