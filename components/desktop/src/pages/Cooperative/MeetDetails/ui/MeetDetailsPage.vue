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
        q-card(flat).info-card.hover
          MeetDetailsInfo(:meet="meet")

          MeetDetailsActions(
            :meet="meet"
            :coopname="coopname"
            :meet-hash="meetHash"
          )

        // Показываем результаты собрания, если оно завершено
        template(v-if="isProcessed")
          // Отображаем документ собрания, если он есть
          ExpandableDocument(
            v-if="!!meet?.processed?.decisionAggregate"
            :documentAggregate="meet.processed.decisionAggregate"
            title="Протокол решения общего собрания пайщиков"
          ).q-mt-lg

          q-card(flat).info-card.q-mt-lg
            MeetDetailsResults(
              :meet="meet"
            )


        // Показываем повестку и голосование, если собрание еще не завершено
        template(v-else)
          q-card(flat).info-card.q-mt-lg
            MeetDetailsAgenda(
              :meet="meet"
            )

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
import { ExpandableDocument } from 'src/shared/ui'
import { useMeetStore } from 'src/entities/Meet'
import { FailAlert } from 'src/shared/api'
import { useDesktopStore } from 'src/entities/Desktop/model'
import { useBackButton } from 'src/shared/lib/navigation'

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

let intervalId: ReturnType<typeof setInterval> | null = null

const loadMeetDetails = async () => {
  try {
    await meetStore.loadMeet({
      coopname: coopname.value,
      hash: meetHash.value
    })

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
