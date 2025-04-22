<template lang="pug">
div.q-pa-md
  q-btn(
    color="primary"
    icon="arrow_back"
    label="Назад к списку собраний"
    @click="goBack"
    class="q-mb-md"
  )

  div(v-if="loading")
    q-skeleton(type="rect" height="200px" class="q-mb-md")
    q-skeleton(type="rect" height="100px" v-for="i in 3" :key="i" class="q-mb-md")

  div(v-else-if="!meet")
    div.text-h5.text-center Собрание не найдено

  div(v-else)
    div.text-h5.q-mb-md Общее собрание {{ meet.hash.substring(0, 10) }}

    // Информация о собрании
    MeetInfoCard(
      :meet="meet"
      :can-manage="false"
      :can-close="false"
      :can-restart="false"
      class="q-mb-lg"
    )

    // Вопросы повестки
    div.text-h6.q-mb-md Вопросы повестки

    div.row.q-col-gutter-md
      div.col-12.col-md-6(v-for="(item, index) in meetAgendaItems" :key="index")
        q-card(flat bordered)
          q-card-section
            div.text-h6 {{ item.title }}
            q-separator.q-my-sm
            div.text-body1 {{ item.context }}
            q-separator.q-my-sm
            div.text-subtitle1.text-weight-bold Решение
            div.text-body2 {{ item.decision }}

          q-card-section(v-if="meet.processing?.meet?.status === 'open'")
            div.text-subtitle1.q-mb-sm Ваш голос:
            div.row.q-col-gutter-sm
              div.col-4
                q-radio(
                  v-model="votes[index]"
                  val="for"
                  label="ЗА"
                  color="positive"
                )
              div.col-4
                q-radio(
                  v-model="votes[index]"
                  val="against"
                  label="ПРОТИВ"
                  color="negative"
                )
              div.col-4
                q-radio(
                  v-model="votes[index]"
                  val="abstained"
                  label="ВОЗДЕРЖАЛСЯ"
                  color="grey"
                )

    // Кнопка голосования
    div.row.justify-center.q-mt-lg(v-if="meet.processing?.meet?.status === 'open'")
      q-btn.q-px-xl(
        color="primary"
        label="ГОЛОСОВАТЬ"
        size="lg"
        :loading="isVoting"
        @click="submitVote"
        :disable="!allVotesSelected"
      )

</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { MeetInfoCard } from 'src/widgets/Meets'
import { useMeetStore } from 'src/entities/Meet'
import { useSessionStore } from 'src/entities/Session'
import { voteOnMeet, type IVoteOnMeetInput } from 'src/features/Meet/VoteOnMeet'
import { generateBallot } from 'src/features/Meet/GenerateBallot'
import { useSignDocument } from 'src/shared/lib/document'
import { FailAlert } from 'src/shared/api'
import type { IMeet } from 'src/entities/Meet'

const route = useRoute()
const router = useRouter()
const meetStore = useMeetStore()
const sessionStore = useSessionStore()
const { signDocument } = useSignDocument()

const coopname = computed(() => route.params.coopname as string)
const meetHash = computed(() => route.params.hash as string)

const meet = ref<IMeet | null>(null)
const loading = ref(true)
const isVoting = ref(false)

// Инициализация голосов для каждого пункта повестки
const votes = ref<Record<number, 'for' | 'against' | 'abstained'>>({})

// Проверка, что все голоса выбраны
const allVotesSelected = computed(() => {
  if (!meetAgendaItems.value.length) return false

  return meetAgendaItems.value.every((_, index) => {
    return votes.value[index] !== undefined
  })
})

// Получение пунктов повестки из данных собрания
const meetAgendaItems = computed(() => {
  if (!meet.value) return []

  // Используем данные из processing или возвращаем пустой массив,
  // если структура или свойство не существуют
  return meet.value.processing?.questions || []
})

// Загрузка данных о собрании
const loadMeetDetails = async () => {
  loading.value = true
  try {
    const result = await meetStore.loadMeet({
      coopname: coopname.value,
      hash: meetHash.value
    })
    meet.value = result
  } catch (error: any) {
    FailAlert(error)
  } finally {
    loading.value = false
  }
}

// Возврат к списку собраний
const goBack = () => {
  router.back()
}

// Отправка голоса
const submitVote = async () => {
  if (!meet.value || !allVotesSelected.value) return

  isVoting.value = true
  try {
    // Преобразование голосов в формат для отправки
    const votesData = meetAgendaItems.value.map((item, index) => ({
      agenda_id: index,
      vote: votes.value[index]
    }))

    // Генерация бюллетеня
    const generatedBallot = await generateBallot({
      coopname: coopname.value,
      username: sessionStore.username,
      meet_hash: meetHash.value
    })

    // Подписание бюллетеня
    const signedBallot = await signDocument(generatedBallot)

    // Отправка голоса
    await voteOnMeet({
      coopname: coopname.value,
      hash: meetHash.value,
      ballot: signedBallot,
      member: sessionStore.username,
      votes: votesData
    } as unknown as IVoteOnMeetInput)

    Notify.create({
      type: 'positive',
      message: 'Ваш голос успешно отправлен'
    })

    // Перезагрузка данных
    await loadMeetDetails()
  } catch (error: any) {
    FailAlert(error)
  } finally {
    isVoting.value = false
  }
}

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadMeetDetails()
})
</script>
