<template lang="pug">
div.q-pa-md
  // Редактор названия проекта
  ProjectTitleEditor(
    :project='project'
    @field-change="handleFieldChange"
    @update:title="handleTitleUpdate"
  ).q-mb-md.full-width
    template(#prepend-icon)
      q-icon(name='work', size='24px', color='primary')

  // Элементы управления проектом
  ProjectControls(:project='project').full-width
</template>

<script lang="ts" setup>
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { ProjectTitleEditor, ProjectControls } from 'app/extensions/capital/widgets'

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

// Обработчик обновления названия проекта
const handleTitleUpdate = (value: string) => {
  emit('update:title', value)
}
</script>

<style lang="scss" scoped>
</style>
