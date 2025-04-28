<template lang="pug">
q-card(flat class="card-container q-pa-md" v-if="canVote")
  div.text-h6.q-mb-md Голосование

  div.row.q-col-gutter-md
    div.col-12.col-md-6(v-for="(item, index) in meetAgendaItems" :key="index")
      q-card(flat bordered)
        q-card-section
          div.text-h6 {{ item.title }}
          q-separator.q-my-sm
          div.text-body1 {{ item.context }}
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

  q-banner(rounded class="bg-blue-1 text-blue-8 q-mt-md" v-if="isVotingNotStarted")
    div.text-center.text-subtitle1 Голосование еще не началось. Дата начала: {{ formattedOpenDate }}
  q-banner(rounded class="bg-blue-1 text-blue-8 q-mt-md" v-else-if="isVotingEnded")
    div.text-center.text-subtitle1 Голосование уже завершено. Дата окончания: {{ formattedCloseDate }}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { useMeetDetailsVoting } from './model'

const props = defineProps<{
  meet: IMeet
  coopname: string
  meetHash: string
}>()

const isVoting = ref(false)
const votes = ref<Record<number, 'for' | 'against' | 'abstained'>>({})

const {
  canVote,
  meetAgendaItems,
  allVotesSelected,
  isVotingNotStarted,
  isVotingEnded,
  formattedOpenDate,
  formattedCloseDate,
  submitVote
} = useMeetDetailsVoting(props.meet, props.coopname, props.meetHash, votes, isVoting)
</script> 