<template lang="pug">
div
  div.text-h5.q-mb-md.text-center Голосование
  div
    div(flat class="card-container q-pa-md" v-if="isVotingNow")


      div.row.q-col-gutter-md
        div.col-12.col-md-12(v-for="(item, index) in meetAgendaItems" :key="index")
          q-card(flat bordered)
            q-card-section
              div.text-h6 {{ item.title }}
              div.text-body1 {{ item.context }}
              q-separator.q-my-sm
              div.text-body1 {{ item.decision }}
              q-separator.q-my-sm
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

      div.row.justify-center.q-mt-lg
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
import { ref, onMounted, onUnmounted } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { useSessionStore } from 'src/entities/Session'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { generateBallot } from 'src/features/Meet/GenerateBallot'
import { useSignDocument } from 'src/shared/lib/document'
import { useVoteOnMeet, type IVoteOnMeetInput } from 'src/features/Meet/VoteOnMeet'

const props = defineProps<{
  meet: IMeet
  coopname: string
  meetHash: string
}>()

const {
  votes,
  meetAgendaItems,
  isVotingNow,
  allVotesSelected,
  setMeet,
  voteOnMeet,
  resetVotes
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
  if (!isVotingNow.value || !allVotesSelected.value) return

  isVoting.value = true
  try {
    const votesData = meetAgendaItems.value.map((item, index) => ({
      question_id: item.id,
      vote: votes.value[index]
    }))

    const generatedBallot = await generateBallot({
      coopname: props.coopname,
      username: sessionStore.username,
    })

    const signedBallot = await signDocument(generatedBallot, sessionStore.username)

    const vote: IVoteOnMeetInput = {
      coopname: props.coopname,
      hash: props.meetHash,
      ballot: signedBallot,
      username: sessionStore.username,
      votes: votesData
    }

    await voteOnMeet(vote)
    SuccessAlert('Ваш голос успешно отправлен')
  } catch (error: any) {
    FailAlert(error)
  } finally {
    isVoting.value = false
  }
}
</script>
