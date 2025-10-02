<template lang="pug">
q-select(
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
  @update:model-value="handleStatusChange"
)
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Zeus } from '@coopenomics/sdk'
import { getIssueStatusColor, getIssueStatusLabel } from 'app/extensions/capital/shared/lib'
import { useUpdateIssue } from '../../model'

interface Props {
  modelValue: Zeus.IssueStatus
  issueHash: string
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: Zeus.IssueStatus): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Статус'
})

const emit = defineEmits<Emits>()

const route = useRoute()
const projectHash = computed(() => route.params.project_hash as string)

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
  { value: Zeus.IssueStatus.DONE, label: getIssueStatusLabel(Zeus.IssueStatus.DONE) },
  { value: Zeus.IssueStatus.CANCELED, label: getIssueStatusLabel(Zeus.IssueStatus.CANCELED) },
]

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
