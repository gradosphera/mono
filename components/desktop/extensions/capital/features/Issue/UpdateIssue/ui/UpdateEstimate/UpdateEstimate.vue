<template lang="pug">
q-input(
  v-model.number="selectedEstimate"
  type="number"
  :min="0"
  step="0.5"
  standout="bg-teal text-white"
  :label="label"
  @update:model-value="handleEstimateChange"
  dense
)
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUpdateIssue } from '../../model'

interface Props {
  modelValue: number
  issueHash: string
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Оценка (часы)'
})

const emit = defineEmits<Emits>()

// Используем composable для обновления задач
const { debounceSave } = useUpdateIssue()

// Текущая выбранная оценка
const selectedEstimate = ref<number>(props.modelValue)

// Обработчик изменения оценки
const handleEstimateChange = async (newEstimate: string | number | null) => {
  // Конвертируем в число, по умолчанию 0
  const numericEstimate = typeof newEstimate === 'string' ? parseFloat(newEstimate) : (newEstimate || 0)

  // Проверяем, что значение валидное и не отрицательное
  const validEstimate = isNaN(numericEstimate) ? 0 : Math.max(0, numericEstimate)

  if (validEstimate === props.modelValue) return

  try {
    const updateData = {
      issue_hash: props.issueHash,
      estimate: validEstimate,
    }

    // Автоматическое сохранение с задержкой
    debounceSave(updateData)

    // Обновляем локальное значение
    emit('update:modelValue', validEstimate)
  } catch (error) {
    console.error('Failed to update estimate:', error)
  }
}

// Синхронизируем с внешним значением
watch(() => props.modelValue, (newValue) => {
  selectedEstimate.value = newValue
})
</script>
