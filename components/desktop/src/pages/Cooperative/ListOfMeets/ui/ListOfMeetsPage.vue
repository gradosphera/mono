<template lang="pug">
div.q-pa-md
  div.text-h6.q-mb-md Общие собрания

  div.row.justify-center
    div.col-12
      div.row.q-mb-md.justify-end(v-if="canCreateMeet")
        q-btn(
          color="primary"
          label="Создать общее собрание"
          @click="showCreateMeetDialog = true"
        )

      MeetsTable(
        :meets="meets"
        :loading="loading"
        @vote="handleVote"
        @close="handleCloseMeet"
        @restart="showRestartMeetDialog"
      )

  CreateMeetForm(
    v-model="showCreateMeetDialog"
    :loading="isCreating"
    @create="handleCreateAndClose"
  )
  RestartMeetForm(
    v-model="showRestartDialog"
    :meet="currentMeetToRestart"
    :loading="isRestarting"
    @restart="handleRestartAndClose"
  )
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { MeetsTable } from 'src/widgets/Meets'
import { CreateMeetForm } from 'src/features/Meet/CreateMeetWithAgenda'
import { RestartMeetForm } from 'src/features/Meet/RestartMeetWithProposal'
import { useMeetManagement } from '../model'
import type { IMeet } from 'src/entities/Meet'

const route = useRoute()
const coopname = computed(() => route.params.coopname as string)

const {
  meets,
  loading,
  loadMeets,
  handleCreateMeet,
  handleCloseMeet,
  handleRestartMeet,
  handleVote
} = useMeetManagement(coopname.value)

// Диалоги
const showCreateMeetDialog = ref(false)
const showRestartDialog = ref(false)
const currentMeetToRestart = ref<IMeet | null>(null)

// Состояния загрузки
const isCreating = ref(false)
const isRestarting = ref(false)

// Обработчики
const handleCreateAndClose = async (formData: any) => {
  isCreating.value = true
  try {
    const success = await handleCreateMeet(formData)
    if (success) {
      showCreateMeetDialog.value = false
    }
  }
  finally {
    isCreating.value = false
  }
}

const showRestartMeetDialog = (meet: IMeet) => {
  currentMeetToRestart.value = meet
  showRestartDialog.value = true
}

const handleRestartAndClose = async (data: any) => {
  isRestarting.value = true
  try {
    const success = await handleRestartMeet(data)
    if (success) {
      showRestartDialog.value = false
      currentMeetToRestart.value = null
    }
  } finally {
    isRestarting.value = false
  }
}

// Проверка разрешений
const canCreateMeet = computed(() => {
  return true // Здесь можно добавить проверку ролей
})

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadMeets()
})
</script>
