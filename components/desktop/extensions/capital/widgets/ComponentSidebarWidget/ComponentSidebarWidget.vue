<template lang="pug">
div.q-pa-md
  // Редактор названия компонента
  ProjectTitleEditor(
    :project='project'
    label="Компонент"
    @field-change="handleFieldChange"
    @update:title="handleTitleUpdate"
  ).full-width
    template(#prepend-icon)
      q-icon(name='fa-regular fa-file-code', size='24px', color='primary')

  // Путь к родительскому проекту
  ComponentToProjectPathWidget(:project='project')

  // Элементы управления компонентом
  ProjectControls(:project='project').full-width

  DeleteProjectSidebarButton(
    v-if='project'
    :coopname='project.coopname'
    :project-hash='project.project_hash'
    :can-delete='project.permissions?.can_delete_project ?? false'
    entity-label='компонент'
    @deleted='emit("project-deleted")'
  )

</template>

<script lang="ts" setup>
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { ProjectTitleEditor, ProjectControls, ComponentToProjectPathWidget } from 'app/extensions/capital/widgets'
import { DeleteProjectSidebarButton } from 'app/extensions/capital/features/Project/DeleteProject'

interface Props {
  project: IProject | null | undefined
}

defineProps<Props>()

const emit = defineEmits<{
  fieldChange: []
  'update:title': [value: string]
  'project-deleted': []
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
