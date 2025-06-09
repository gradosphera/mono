<template lang="pug">
q-card(flat).card-container.q-pa-md
  div(v-if="loading")
    q-skeleton(type="rect" height="200px" class="q-mb-md")
    q-skeleton(type="rect" height="100px" v-for="i in 3" :key="i" class="q-mb-md")


  div(v-else-if="!meet")
    div.text-h5.text-center Собрание не найдено


  div(v-else)
    div.row.q-col-gutter-md.justify-center
      div.col-12.col-md-12
        div.info-card.hover
          MeetDetailsInfo(:meet="meet")
            template(#actions)
              MeetDetailsActions(
                :meet="meet"
                :coopname="coopname"
                :meet-hash="meetHash"
              )

        // Индикатор явки и статус собрания
        q-card(v-if="showQuorumIndicator" flat).info-card.hover.q-mt-lg
          MeetQuorumIndicator(:meet="meet")

        // Показываем результаты собрания, если оно завершено
        template(v-if="isProcessed")
          q-card(flat).info-card.hover.q-mt-lg
            MeetDetailsResults(
              :meet="meet"
            )

        // Показываем повестку и голосование, если собрание еще не завершено
        template(v-else)
          q-card(v-if="showAgenda || isVotingNow" flat).info-card.hover.q-mt-lg
            // Показываем повестку, если голосование еще не началось
            template(v-if="showAgenda")
              MeetDetailsAgenda(
                :meet="meet"
                :coopname="coopname"
                :meet-hash="meetHash"
              )

            // Показываем голосование, если оно началось
            template(v-if="isVotingNow")
              MeetDetailsVoting(
                :meet="meet"
                :coopname="coopname"
                :meet-hash="meetHash"
              )


</template>

<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { MeetDetailsInfo } from 'src/widgets/Meets/MeetDetailsInfo'
import { MeetDetailsActions } from 'src/widgets/Meets/MeetDetailsActions'
import { MeetDetailsAgenda } from 'src/widgets/Meets/MeetDetailsAgenda'
import { MeetDetailsVoting } from 'src/widgets/Meets/MeetDetailsVoting'
import { MeetDetailsResults } from 'src/widgets/Meets/MeetDetailsResults'
import { useMeetStore } from 'src/entities/Meet'
import { FailAlert } from 'src/shared/api'
import { useDesktopStore } from 'src/entities/Desktop/model'
import { useBackButton } from 'src/shared/lib/navigation'
import { useVoteOnMeet } from 'src/features/Meet/VoteOnMeet'
import { MeetQuorumIndicator } from 'src/widgets/Meets/MeetQuorumIndicator'
import { Zeus } from '@coopenomics/sdk'

const route = useRoute()
const meetStore = useMeetStore()
const desktopStore = useDesktopStore()

const coopname = computed(() => route.params.coopname as string)
const meetHash = computed(() => route.params.hash as string)

const meet = computed(() => meetStore.currentMeet)
const loading = ref(true)

// Проверяем, завершено ли собрание
const isProcessed = computed(() => {
  return !!meet.value?.processed
})

const showAgenda = computed(() => {
  return meet.value?.processing?.extendedStatus === Zeus.ExtendedMeetStatus.WAITING_FOR_OPENING
})

// Используем хук для управления голосованием
const { isVotingNow, setMeet, showQuorumIndicator } = useVoteOnMeet()

let intervalId: ReturnType<typeof setInterval> | null = null

const loadMeetDetails = async () => {
  try {
    await meetStore.loadMeet({
      coopname: coopname.value,
      hash: meetHash.value
    })

    // Устанавливаем собрание в композабл после загрузки
    if (meet.value) {
      setMeet(meet.value)
    }

  } catch (error: any) {
    FailAlert(error)
  } finally {
    loading.value = false
  }
}

// Настройка кнопки навигации
const workspace = computed(() => desktopStore.activeWorkspaceName)
const buttonText = computed(() => workspace.value === 'soviet' ? 'Собрания' : 'Мои Собрания')
const targetRouteName = computed(() => workspace.value === 'soviet' ? 'meets' : 'user-meets')

// Используем хук для управления кнопкой
useBackButton({
  text: buttonText.value,
  routeName: targetRouteName.value,
  params: { coopname: coopname.value },
  componentId: 'meet-details-' + meetHash.value
})

// Загрузка деталей собрания
onMounted(() => {
  loading.value = true
  loadMeetDetails()
  intervalId = setInterval(() => {
    loadMeetDetails()
  }, 15000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})
</script>
