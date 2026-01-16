<template lang="pug">
q-select(
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
)
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Zeus } from '@coopenomics/sdk'
import type { IProject } from 'app/extensions/capital/entities/Project/model'

import { useUpdateProjectStatus } from '../model'
import { getProjectStatusLabel } from 'app/extensions/capital/shared/lib/projectStatus'
import { FailAlert } from 'src/shared/api/alerts'

interface Props {
  project: IProject | undefined
  label?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Статус',
  readonly: false
})

// Ref для доступа к q-select компоненту
const selectRef = ref()

// Используем composable для обновления проекта
const { updateProjectStatus } = useUpdateProjectStatus()

// Текущий выбранный статус, инициализируем из project.status
const selectedStatus = ref<Zeus.ProjectStatus>(props.project?.status || Zeus.ProjectStatus.UNDEFINED)

// Предыдущий статус для сравнения
const previousStatus = ref<Zeus.ProjectStatus>(props.project?.status || Zeus.ProjectStatus.UNDEFINED)

// Computed свойство для определения readonly на основе permissions
const readonly = computed(() => {
  return props.readonly || !props.project?.permissions?.can_change_project_status
})


// Опции для выбора статуса
const statusOptions = [
  { value: Zeus.ProjectStatus.PENDING, label: getProjectStatusLabel(Zeus.ProjectStatus.PENDING) },
  { value: Zeus.ProjectStatus.ACTIVE, label: getProjectStatusLabel(Zeus.ProjectStatus.ACTIVE) },
  { value: Zeus.ProjectStatus.VOTING, label: getProjectStatusLabel(Zeus.ProjectStatus.VOTING) },
  { value: Zeus.ProjectStatus.RESULT, label: getProjectStatusLabel(Zeus.ProjectStatus.RESULT) },
  { value: Zeus.ProjectStatus.FINALIZED, label: getProjectStatusLabel(Zeus.ProjectStatus.FINALIZED) },
  { value: Zeus.ProjectStatus.CANCELLED, label: getProjectStatusLabel(Zeus.ProjectStatus.CANCELLED) },
]

// Обработчик клика по селекту - переключает dropdown
const handleClick = () => {
  if (!readonly.value && selectRef.value) {
    // selectRef.value.togglePopup() //TODO: не работает потому что не существует
  }
}

// Обработчик изменения статуса
const handleStatusChange = async (newStatus: Zeus.ProjectStatus) => {
  if (!newStatus || !props.project || newStatus === previousStatus.value || readonly.value) return

  // Сохраняем старое значение для отката (из previousStatus, а не из selectedStatus!)
  const oldStatus = previousStatus.value

  try {
    // Временно обновляем локальное значение для визуальной обратной связи
    selectedStatus.value = newStatus

    // Получаем coopname из проекта (предполагаем что он есть в поле coopname или можем получить из контекста)
    const coopname = (props.project as any).coopname || ''
    console.log('updateProjectStatus', props.project.project_hash, newStatus, coopname)
    await updateProjectStatus(props.project.project_hash, newStatus, coopname)

    // Успешно обновлено - теперь можно обновить previousStatus
    previousStatus.value = newStatus
  } catch (error) {
    // Откатываем к изначальному значению (к previousStatus, которое хранит правильное старое значение)
    selectedStatus.value = oldStatus
    FailAlert(error)
    console.error('Failed to update status:', error)
  }
}

// Синхронизируем локальное состояние с project.status при изменении пропса
watch(() => props.project?.status, (newStatus) => {
  if (newStatus) {
    selectedStatus.value = newStatus
    previousStatus.value = newStatus
  }
})
</script>
