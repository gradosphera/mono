<template lang="pug">
div
  // Баннер для уже проголосовавших пользователей
  q-banner.q-mb-md(
    v-if="meet?.processing?.isVoted"
    rounded
    color="positive"
    text-color="white"
  )
    template(#avatar)
      q-icon(name="how_to_vote" color="primary" size="50px" class="q-mt-md q-mb-md")
    div.text-body1.text-weight-medium Вы уже приняли участие в голосовании
    div.text-caption Ваш голос принят и учтен

  q-card(v-if="!meet?.processing?.isVoted", flat)
    q-card-section.text-center
      .text-h6 Голосование
    div(v-for="(item, index) in meetAgendaItems", :key="index")
      q-separator

      q-card-section
        .row.items-start.q-col-gutter-md
          .col-auto
            AgendaNumberAvatar(:number="item.number")
          .col
            .text-h6.q-mb-sm {{ item.title }}
            .text-body1.q-mb-sm(v-html="parseLinks(item.context)")
            q-separator.q-my-md
            .text-body1.q-mb-sm(v-html="parseLinks(item.decision)")
            q-separator.q-my-md
            .text-subtitle1.q-mb-sm Ваш голос:
            .row.q-col-gutter-sm
              .col-12.col-md-4
                q-radio(
                  v-model="votes[index]",
                  val="for",
                  label="ЗА",
                  color="positive"
                )
              .col-12.col-md-4
                q-radio(
                  v-model="votes[index]",
                  val="against",
                  label="ПРОТИВ",
                  color="negative"
                )
              .col-12.col-md-4
                q-radio(
                  v-model="votes[index]",
                  val="abstained",
                  label="ВОЗДЕРЖАЛСЯ",
                  color="grey"
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
