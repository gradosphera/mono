<template lang="pug">
div
  div.row.q-col-gutter-md
    div.col-12.col-md-auto(v-if="canCloseBySecretary")
      q-btn(
        color="primary"
        icon="fa-solid fa-door-closed"
        label="Закрыть собрание"
        @click="closeMeetBySecretary"
        :loading="isProcessing"
      )
    div.col-12.col-md-auto(v-if="canCloseByPresider")
      q-btn(
        color="primary"
        icon="fa-solid fa-check"
        label="Утвердить собрание"
        @click="closeMeetByPresider"
        :loading="isProcessing"
      )
    div.col-12.col-md-auto(v-if="canRestartMeet")
      RestartMeet(
        show-button
        @restart="handleRestartMeet"
        :loading="isProcessing"
      )

</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCloseMeet } from 'src/features/Meet/CloseMeetWithDecision/model'
import { useRestartMeet } from 'src/features/Meet/RestartMeet/model'
import { RestartMeet } from 'src/features/Meet/RestartMeet'
import { useMeetStore } from 'src/entities/Meet'
import type { IMeet } from 'src/entities/Meet'

const props = defineProps<{
  meet: IMeet
  coopname: string
  meetHash: string
}>()

const isProcessing = ref(false)
const meetStore = useMeetStore()

// Устанавливаем текущее собрание в store при монтировании и обновлении пропсов
onMounted(() => {
  meetStore.setCurrentMeet(props.meet)
})

watch(() => props.meet, (newMeet) => {
  meetStore.setCurrentMeet(newMeet)
}, { deep: true })

const {
  canCloseBySecretary,
  canCloseByPresider,
  closeMeetBySecretary,
  closeMeetByPresider
} = useCloseMeet(isProcessing)

const {
  canRestartMeet,
  handleRestartMeet
} = useRestartMeet(isProcessing)

</script>
