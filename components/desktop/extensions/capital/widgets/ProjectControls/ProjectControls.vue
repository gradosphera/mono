<template lang="pug">
div
  UpdateStatus(
    v-if='project'
    :project='project'
    label='Статус'
  ).q-mb-sm.full-width
  SetMasterButton(
    v-if='project'
    :project='project'
    dense
    flat
    :multiSelect='false'
    placeholder=''
  ).q-mb-sm.full-width

  UpdateProjectVideo(v-if="project" :project="project")

  // не показываем на проектах, но показываем на компонентах
  OpenCloseToggle(v-if='project && project.parent_hash !== EMPTY_HASH' :project='project').full-width
</template>

<script setup lang="ts">
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { UpdateStatus } from '../../features/Project/UpdateProjectStatus'
import { SetMasterButton } from '../../features/Project/SetMaster'
import { OpenCloseToggle } from '../../features/Project/OpenCloseProject/ui'
import { UpdateProjectVideo } from '../../features/Project/UpdateProjectVideo'
import { EMPTY_HASH } from 'src/shared/lib/consts'

interface Props {
  project: IProject | null | undefined
}

defineProps<Props>()
</script>
