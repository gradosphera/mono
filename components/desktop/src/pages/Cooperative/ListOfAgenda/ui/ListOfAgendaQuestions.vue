<template lang="pug">
q-card(flat)
  QuestionsTable(
    :decisions="decisions"
    :loading="loading"
    :isChairman="currentUser.isChairman"
    :format-decision-title="formatDecisionTitle"
    :is-voted-for="isVotedFor"
    :is-voted-against="isVotedAgainst"
    :is-voted-any="isVotedAny"
    @authorize="onAuthorizeDecision"
    @vote-for="onVoteFor"
    @vote-against="onVoteAgainst"
  )
    template(#top)
      CreateProjectFreeDecisionButton
</template>

<script setup lang="ts">
import { onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrentUserStore } from 'src/entities/User'
import { CreateProjectFreeDecisionButton } from 'src/features/Decision/CreateProject'
import { useDecisionProcessor } from 'src/processes/process-decisions'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { QuestionsTable } from 'src/widgets/Questions'

const route = useRoute()
const currentUser = useCurrentUserStore()

// Получаем процесс обработки решений
const decisionProcessor = useDecisionProcessor()
const {
  loading,
  loadDecisions,
  authorizeAndExecuteDecision,
  voteForDecision,
  voteAgainstDecision,
  isVotedFor,
  isVotedAgainst,
  isVotedAny,
  formatDecisionTitle
} = decisionProcessor

// Данные
const decisions = computed(() => decisionProcessor.decisions.value)

// Обработчики событий
const onAuthorizeDecision = async (row) => {
  try {
    await authorizeAndExecuteDecision(row)
    SuccessAlert('Решение принято и исполнено')
    await loadDecisions(route.params.coopname as string)
  } catch (e) {
    FailAlert(e)
  }
}

const onVoteFor = async (decision_id) => {
  try {
    await voteForDecision(decision_id)
    SuccessAlert('Голос принят')
    await loadDecisions(route.params.coopname as string)
  } catch (e) {
    FailAlert(e)
  }
}

const onVoteAgainst = async (decision_id) => {
  try {
    await voteAgainstDecision(decision_id)
    SuccessAlert('Голос принят')
    await loadDecisions(route.params.coopname as string)
  } catch (e) {
    FailAlert(e)
  }
}

// Инициализация
loadDecisions(route.params.coopname as string)

// Периодическое обновление данных
const interval = setInterval(() => loadDecisions(route.params.coopname as string, true), 10000)
onBeforeUnmount(() => clearInterval(interval))
</script>
