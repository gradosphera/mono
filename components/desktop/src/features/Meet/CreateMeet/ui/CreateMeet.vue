<template lang="pug">
div
  q-btn(
    color="primary"
    label="Создать общее собрание"
    @click="showCreateMeetDialog = true"
  )
  CreateMeetForm(
    v-model="showCreateMeetDialog"
    :loading="isCreating"
    @create="handleCreate"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CreateMeetForm } from './index'
import { createMeetWithAgenda } from '../model'
import { useSessionStore } from 'src/entities/Session'
import { useMeetStore } from 'src/entities/Meet'
import { useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { FailAlert } from 'src/shared/api'

const route = useRoute()
const sessionStore = useSessionStore()
const meetStore = useMeetStore()

const showCreateMeetDialog = ref(false)
const isCreating = ref(false)

const handleCreate = async (formData: any) => {
  isCreating.value = true
  try {
    await createMeetWithAgenda({
      coopname: route.params.coopname as string,
      initiator: formData.initiator,
      presider: formData.presider,
      secretary: formData.secretary,
      open_at: formData.open_at,
      close_at: formData.close_at,
      username: sessionStore.username,
      agenda_points: formData.agenda_points
    })

    Notify.create({
      message: 'Собрание успешно создано',
      type: 'positive',
    })

    // Закрываем диалог
    showCreateMeetDialog.value = false

    // Обновляем список собраний через стор
    await meetStore.loadMeets({ coopname: route.params.coopname as string })

    return true
  } catch (e: any) {
    FailAlert(e)
    return false
  } finally {
    isCreating.value = false
  }
}
</script>
