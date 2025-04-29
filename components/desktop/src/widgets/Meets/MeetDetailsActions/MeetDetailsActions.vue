<template lang="pug">
q-card(flat class="card-container q-pa-md" v-if="canManageMeet")
  div.row.q-col-gutter-md
    div.col-12.col-md-auto(v-if="canCloseBySecretary")
      q-btn(
        color="negative"
        icon="fa-solid fa-door-closed"
        label="Закрыть собрание (Секретарь)"
        @click="closeMeetBySecretary"
        :loading="isProcessing"
      )
    div.col-12.col-md-auto(v-if="canCloseByPresider")
      q-btn(
        color="negative"
        icon="fa-solid fa-door-closed"
        label="Закрыть собрание (Председатель)"
        @click="closeMeetByPresider"
        :loading="isProcessing"
      )
    div.col-12.col-md-auto(v-if="canRestartMeet")
      RestartMeet(
        :meet="meet"
        show-button
        @restart="handleRestartMeet"
      )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RestartMeet } from 'src/features/Meet/RestartMeet'
import type { IMeet } from 'src/entities/Meet'
import { useMeetDetailsManagement } from 'src/features/Meet/MeetDetailsManagement'

const props = defineProps<{
  meet: IMeet
  coopname: string
  meetHash: string
}>()

const isProcessing = ref(false)

const {
  canManageMeet,
  canCloseBySecretary,
  canCloseByPresider,
  canRestartMeet,
  closeMeetBySecretary,
  closeMeetByPresider,
  handleRestartMeet
} = useMeetDetailsManagement(props.meet, props.coopname, props.meetHash, isProcessing)
</script> 