<template lang="pug">
q-select(
  v-model="selectedPriority"
  :options="priorityOptions"
  option-value="value"
  option-label="label"
  emit-value
  map-options
  :color="getIssuePriorityColor(selectedPriority)"
  text-color="white"
  :bg-color="priorityBgColor"
  dense
  :standout="priorityStandout"
  :label="label"
  @update:model-value="handlePriorityChange"
)
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Zeus } from '@coopenomics/sdk'
import { getIssuePriorityColor, getIssuePriorityLabel } from 'app/extensions/capital/shared/lib'
import { useUpdateIssue } from '../../model'

interface Props {
  modelValue: Zeus.IssuePriority
  issueHash: string
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: Zeus.IssuePriority): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Приоритет'
})

const emit = defineEmits<Emits>()

// Используем composable для обновления задач
const { debounceSave } = useUpdateIssue()

// Текущий выбранный приоритет
const selectedPriority = ref<Zeus.IssuePriority>(props.modelValue)

// Computed свойство для standout в зависимости от приоритета
const priorityStandout = computed(() => {
  const color = getIssuePriorityColor(selectedPriority.value)
  return `bg-${color} text-white`
})

// Computed свойство для bg-color в зависимости от приоритета
const priorityBgColor = computed(() => getIssuePriorityColor(selectedPriority.value))

// Опции для выбора приоритета
const priorityOptions = [
  { value: Zeus.IssuePriority.LOW, label: getIssuePriorityLabel(Zeus.IssuePriority.LOW) },
  { value: Zeus.IssuePriority.MEDIUM, label: getIssuePriorityLabel(Zeus.IssuePriority.MEDIUM) },
  { value: Zeus.IssuePriority.HIGH, label: getIssuePriorityLabel(Zeus.IssuePriority.HIGH) },
  { value: Zeus.IssuePriority.URGENT, label: getIssuePriorityLabel(Zeus.IssuePriority.URGENT) },
]

// Обработчик изменения приоритета
const handlePriorityChange = async (newPriority: Zeus.IssuePriority) => {
  if (!newPriority || newPriority === props.modelValue) return

  try {
    const updateData = {
      issue_hash: props.issueHash,
      priority: newPriority,
    }

    // Автоматическое сохранение с задержкой
    debounceSave(updateData)

    // Обновляем локальное значение
    emit('update:modelValue', newPriority)
  } catch (error) {
    console.error('Failed to update priority:', error)
  }
}

// Синхронизируем с внешним значением
watch(() => props.modelValue, (newValue) => {
  selectedPriority.value = newValue
})
</script>
