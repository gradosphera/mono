<template lang="pug">
div.q-pa-md
  // Редактор названия компонента
  ProjectTitleEditor(
    :project='project'
    label="Компонент"
    @field-change="handleFieldChange"
    @update:title="handleTitleUpdate"
  ).q-mb-md.full-width
    template(#prepend-icon)
      q-icon(name='fa-regular fa-file-code', size='24px', color='primary')

  // Элементы управления компонентом
  ProjectControls(:project='project').full-width

  // Путь к родительскому проекту
  ComponentToProjectPathWidget(:project='project')
</template>

<script lang="ts" setup>
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { ProjectTitleEditor, ProjectControls, ComponentToProjectPathWidget } from 'app/extensions/capital/widgets'

interface Props {
  project: IProject | null | undefined
}

defineProps<Props>()

const emit = defineEmits<{
  fieldChange: []
  'update:title': [value: string]
}>()

// Обработчик изменения полей
const handleFieldChange = () => {
  emit('fieldChange')
}

// Обработчик обновления названия компонента
const handleTitleUpdate = (value: string) => {
  emit('update:title', value)
}
</script>

<style lang="scss" scoped>
</style>
