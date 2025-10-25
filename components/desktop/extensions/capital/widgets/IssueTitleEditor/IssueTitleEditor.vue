<template lang="pug">
q-input(
  v-if="issue"
  v-model='title'
  :label='label || "Задача"'
  filled
  :readonly="!permissions?.can_edit_issue"
  @input="handleTitleChange"
  :rules="[val => !!val || 'Название задачи обязательно']"
).full-width
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { IIssue, IIssuePermissions } from 'app/extensions/capital/entities/Issue/model'
import { useUpdateIssue } from 'app/extensions/capital/features/Issue/UpdateIssue'

const props = defineProps<{
  issue: IIssue | null | undefined
  label?: string
}>()

const emit = defineEmits<{
  fieldChange: []
  'update:title': [value: string]
}>()

const route = useRoute()
const projectHash = computed(() => route.params.project_hash as string)

// Используем composable для обновления задач
const { debounceSave } = useUpdateIssue()

// Локальное состояние для title
const localTitle = ref('')

// Computed свойства для двухсторонней привязки
const title = computed({
  get: () => localTitle.value,
  set: (value: string) => {
    localTitle.value = value
    emit('update:title', value)
  }
})

// Computed для разрешений
const permissions = computed((): IIssuePermissions | null => {
  return props.issue?.permissions || null
})

// Обработчик изменения title
const handleTitleChange = () => {
  if (!props.issue) return

  const updateData = {
    issue_hash: props.issue.issue_hash,
    title: props.issue.title,
  }

  // Запускаем авто-сохранение с задержкой
  debounceSave(updateData, projectHash.value)

  emit('fieldChange')
}

// Watcher для отслеживания изменений issue
watch(() => props.issue, (newIssue) => {
  if (newIssue && localTitle.value !== newIssue.title) {
    localTitle.value = newIssue.title || ''
  }
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
</style>
