<template lang="pug">
q-input(
  v-if="project && project.permissions?.can_edit_project"
  v-model="videoIframe"
  label="Встроить видео (iframe)"
  dense
  standout="bg-teal text-white"
  @change="updateVideo"
  placeholder='<iframe ...>'
).q-mb-sm
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { useEditProject } from '../../EditProject'

interface Props {
  project: IProject | null | undefined
}

const props = defineProps<Props>()

const { saveImmediately } = useEditProject()
const videoIframe = ref('')

const getMeta = (project: any) => {
  try {
    return typeof project?.meta === 'string' ? JSON.parse(project.meta) : project?.meta || {}
  } catch (e) {
    return {}
  }
}

watch(() => props.project, (newProject) => {
  if (newProject) {
    const meta = getMeta(newProject)
    const rawVideo = meta.video || ''
    
    // Декодируем только для отображения в инпуте, чтобы пользователь видел чистый iframe
    if (rawVideo.includes('&lt;')) {
      const txt = document.createElement('textarea')
      txt.innerHTML = rawVideo
      videoIframe.value = txt.value
    } else {
      videoIframe.value = rawVideo
    }
  }
}, { immediate: true })

const updateVideo = async () => {
  if (!props.project) return

  const meta = getMeta(props.project)
  meta.video = videoIframe.value

  const updateData = {
    project_hash: props.project.project_hash || '',
    title: props.project.title || '',
    description: props.project.description || '',
    invite: props.project.invite || '',
    coopname: (props.project as any).coopname || '',
    meta: JSON.stringify(meta),
    data: props.project.data || '',
  }

  await saveImmediately(updateData)
}
</script>
