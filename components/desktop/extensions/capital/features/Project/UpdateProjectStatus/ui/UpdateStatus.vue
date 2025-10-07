<template lang="pug">
q-select(
  v-model="selectedStatus"
  :options="statusOptions"
  option-value="value"
  option-label="label"
  emit-value
  map-options
  :color="getProjectStatusColor(selectedStatus)"
  text-color="white"
  :bg-color="statusBgColor"
  dense
  :standout="statusStandout"
  :label="label"
  :readonly="readonly"
  @update:model-value="handleStatusChange"
)
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Zeus } from '@coopenomics/sdk'
import type { IProject } from 'app/extensions/capital/entities/Project/model'

import { useUpdateProjectStatus } from '../model'
import { getProjectStatusColor, getProjectStatusLabel } from 'app/extensions/capital/shared/lib/projectStatus'
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

// Используем composable для обновления проекта
const { updateProjectStatus } = useUpdateProjectStatus()

// Текущий выбранный статус, инициализируем из project.status
const selectedStatus = ref<Zeus.ProjectStatus>(props.project?.status || Zeus.ProjectStatus.UNDEFINED)

// Предыдущий статус для сравнения
const previousStatus = ref<Zeus.ProjectStatus>(props.project?.status || Zeus.ProjectStatus.UNDEFINED)

// Computed свойство для определения readonly на основе permissions
const readonly = computed(() => {
  return props.readonly || !props.project?.permissions?.can_edit_project
})

// Computed свойство для standout в зависимости от статуса
const statusStandout = computed(() => {
  const color = getProjectStatusColor(selectedStatus.value)
  return `bg-${color} text-white`
})

// Computed свойство для bg-color в зависимости от статуса
const statusBgColor = computed(() => getProjectStatusColor(selectedStatus.value))

// Опции для выбора статуса
const statusOptions = [
  { value: Zeus.ProjectStatus.PENDING, label: getProjectStatusLabel(Zeus.ProjectStatus.PENDING) },
  { value: Zeus.ProjectStatus.ACTIVE, label: getProjectStatusLabel(Zeus.ProjectStatus.ACTIVE) },
  { value: Zeus.ProjectStatus.VOTING, label: getProjectStatusLabel(Zeus.ProjectStatus.VOTING) },
  { value: Zeus.ProjectStatus.COMPLETED, label: getProjectStatusLabel(Zeus.ProjectStatus.COMPLETED) },
  { value: Zeus.ProjectStatus.CLOSED, label: getProjectStatusLabel(Zeus.ProjectStatus.CLOSED) },
]

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
