<template lang="pug">
div
  // Баннер для уже проголосовавших пользователей
  q-banner.q-mb-md(
    v-if="meet?.processing?.isVoted"
    rounded
    color="positive"
    text-color="white"
  ).text-center
    template(#avatar)
      q-icon(name="how_to_vote" color="primary" size="50px" class="q-mt-md q-mb-md")
    div.text-body1.text-weight-medium Вы уже приняли участие в голосовании. Ваш голос принят и учтен.


  div(v-if="!meet?.processing?.isVoted", flat)
    q-card-section.text-center
      .text-h6 Голосование
    q-card(flat bordered v-for="(item, index) in meetAgendaItems", :key="index").q-mb-md.q-pt-md
      q-card-section.q-pa-xs
        div.q-mb-xs.flex.items-start.q-mb-lg.q-pa-xs
          AgendaNumberAvatar(:number="index + 1" class="q-ma-md")
          div.col
            div.text-body1.text-weight-medium.q-mb-2 {{ item.title }}
            div.text-caption.q-mb-1.q-mt-md
              span.text-weight-bold Проект решения:
              span.q-ml-xs {{ item.decision }}
            div.text-caption.q-mt-md
              span.text-weight-bold Приложения:
              span.q-ml-xs(v-if="item.context" v-html="parseLinks(item.context)")
              span.q-ml-xs(v-else) —
            q-separator.q-my-md
            .text-subtitle1.q-mb-sm Ваш голос:
            .row.q-col-gutter-sm
              .col-12.col-md-4

                label.vote-radio-wrapper.positive
                  q-radio(
                    v-model="votes[index]",
                    val="for",
                    color="positive",
                    size="lg",
                    label="ЗА"
                  )
              .col-12.col-md-4
                label.vote-radio-wrapper.negative
                  q-radio(
                    v-model="votes[index]",
                    val="against",
                    color="negative",
                    size="lg",
                    label="ПРОТИВ"
                  )
              .col-12.col-md-4
                label.vote-radio-wrapper.grey
                  q-radio(
                    v-model="votes[index]",
                    val="abstained",
                    color="grey",
                    size="lg",
                    label="ВОЗДЕРЖАЛСЯ"
                  )

    q-separator
    q-card-actions(align="center").q-pa-md
      q-btn.q-px-xl(
        color="primary",
        label="ГОЛОСОВАТЬ",
        size="lg",
        :loading="isVoting",
        @click="submitVote",
        :disable="!allVotesSelected"
      )
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar'
import type { IMeet } from 'src/entities/Meet'
import { useSessionStore } from 'src/entities/Session'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { useSignDocument } from 'src/shared/lib/document'
import { useVoteOnMeet, type IVoteOnMeetInput } from 'src/features/Meet/VoteOnMeet'
import { parseLinks } from 'src/shared/lib/utils'

const props = defineProps<{
  meet: IMeet
  coopname: string
  meetHash: string
}>()

const {
  votes,
  meetAgendaItems,
  allVotesSelected,
  setMeet,
  voteOnMeet,
  resetVotes,
  generateBallot
} = useVoteOnMeet()

const sessionStore = useSessionStore()
const { signDocument } = useSignDocument()

const isVoting = ref(false)

// Устанавливаем собрание из пропсов при монтировании
onMounted(() => {
  // Устанавливаем собрание из пропсов в композабл
  setMeet(props.meet)

  // Сбрасываем голоса при открытии компонента
  resetVotes()
})

// Очищаем ссылку на собрание при размонтировании
onUnmounted(() => {
  setMeet(null)
  resetVotes()
})

const submitVote = async () => {
  if (!allVotesSelected.value) return

  isVoting.value = true
  try {
    const generatedBallot = await generateBallot({
      coopname: props.coopname,
      username: sessionStore.username,
      meet_hash: props.meetHash,
      answers: meetAgendaItems.value.map((question, index) => ({
        id: question.id.toString(),
        number: question.number.toString(),
        vote: votes.value[index]
      }))
    })

    const signedBallot = await signDocument(generatedBallot, sessionStore.username)

    const vote: IVoteOnMeetInput = {
      coopname: props.coopname,
      hash: props.meetHash,
      ballot: signedBallot,
      username: sessionStore.username,
      votes: meetAgendaItems.value.map((item, index) => ({
        question_id: item.id,
        vote: votes.value[index]
      }))
    }

    await voteOnMeet(vote)
    SuccessAlert('Ваш голос успешно отправлен')
  } catch (error: any) {
    console.error(error)
    FailAlert(error)
  } finally {
    isVoting.value = false
  }
}
</script>

<style scoped>
.vote-radio-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.07);
  padding: 18px 8px 12px 8px;
  margin-bottom: 8px;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s;
  color: black;
  cursor: pointer;
}
.vote-radio-wrapper.positive {
  background: #e8f5e9;
}
.vote-radio-wrapper.negative {
  background: #ffebee;
}
.vote-radio-wrapper.grey {
  background: #eceff1;
}
.vote-radio-wrapper:hover {
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.13);
  background: #e3eafc;
}
.vote-icon {
  margin-left: 10px;
}
.q-radio__label {
  font-size: 1.2em;
  font-weight: bold;
}

/* --- DARK THEME SUPPORT --- */
.body--dark .vote-radio-wrapper,
.q-dark .vote-radio-wrapper {
  background: #23272f;
  color: #fff;
}
.body--dark .vote-radio-wrapper.positive,
.q-dark .vote-radio-wrapper.positive {
  background: #295b36;
}
.body--dark .vote-radio-wrapper.negative,
.q-dark .vote-radio-wrapper.negative {
  background: #5b2323;
}
.body--dark .vote-radio-wrapper.grey,
.q-dark .vote-radio-wrapper.grey {
  background: #2c313a;
}
.body--dark .q-radio__label,
.q-dark .q-radio__label {
  color: #fff;
}

/* Кастомизация кружка radio для тёмной темы */
.body--dark :deep(.vote-radio-wrapper .q-radio__inner),
.q-dark :deep(.vote-radio-wrapper .q-radio__inner) {
  border-color: #fff !important;
}
.body--dark :deep(.vote-radio-wrapper.positive .q-radio__inner),
.q-dark :deep(.vote-radio-wrapper.positive .q-radio__inner) {
  border-color: #4caf50 !important;
}
.body--dark :deep(.vote-radio-wrapper.negative .q-radio__inner),
.q-dark :deep(.vote-radio-wrapper.negative .q-radio__inner) {
  border-color: #f44336 !important;
}
.body--dark :deep(.vote-radio-wrapper.grey .q-radio__inner),
.q-dark :deep(.vote-radio-wrapper.grey .q-radio__inner) {
  border-color: #b0bec5 !important;
}
</style>
