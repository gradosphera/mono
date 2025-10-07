<template lang="pug">
.row.items-center.q-gutter-md

  UpdateStatus(
    v-if='project'
    :project='project'
    label='Статус'
  ).col-auto
  OpenCloseToggle(v-if='project' :project='project').col-auto
</template>

<script setup lang="ts">
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { UpdateStatus } from '../../features/Project/UpdateProjectStatus'
import { OpenCloseToggle } from '../../features/Project/OpenCloseProject/ui'

interface Props {
  project: IProject | null | undefined
}

defineProps<Props>()
</script>
