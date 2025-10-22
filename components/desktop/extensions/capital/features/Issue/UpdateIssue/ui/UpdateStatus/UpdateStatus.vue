<template lang="pug">
q-select(
  tabIndex=100
  ref="selectRef"
  v-model="selectedStatus"
  :options="statusOptions"
  option-value="value"
  option-label="label"
  emit-value
  map-options
  dense
  standout="bg-teal text-white"
  :label="label"
  :readonly="readonly"
  @click="handleClick"
  @update:model-value="handleStatusChange"
  style="max-width: 150px"
)
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Zeus } from '@coopenomics/sdk'

import { useUpdateIssue } from '../../model'
import { getIssueStatusLabel } from 'app/extensions/capital/shared/lib'

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
    // selectRef.value.togglePopup() //TODO: не работает потому что не существует
  }
}

// Обработчик изменения статуса
const handleStatusChange = async (newStatus: Zeus.IssueStatus) => {
  if (!newStatus || newStatus === props.modelValue) return

  // Сохраняем предыдущее состояние для возможного отката
  const previousStatus = props.modelValue

  try {
    const updateData = {
      issue_hash: props.issueHash,
      status: newStatus,
    }

    // Обновляем локальное значение оптимистично
    emit('update:modelValue', newStatus)

    // Автоматическое сохранение с задержкой
    await debounceSave(updateData, projectHash.value)
  } catch (error) {
    console.error('Failed to update status:', error)

    // Откатываем к предыдущему состоянию в случае ошибки
    selectedStatus.value = previousStatus
    emit('update:modelValue', previousStatus)
  }
}

// Синхронизируем с внешним значением
watch(() => props.modelValue, (newValue) => {
  selectedStatus.value = newValue
})
</script>
