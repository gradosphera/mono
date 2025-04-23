<template lang="pug">
div.q-pa-xs.col-xs-12.col-sm-12.col-md-12.q-mt-md
  q-card(bordered flat)
    q-card-section.q-py-xs
      div.text-subtitle2 {{ formatDecisionTitle(decision.documents.statement.document.meta.title, decision.documents.statement.action.user) }}
      div.text-caption Аккаунт: {{ decision.table.username }}

    q-separator

    q-card-section.q-py-xs
      div.row.items-center
        div.col-6 Истекает:
        div.col-6.text-right {{ formatToFromNow(decision.table.expired_at) }}

      div.row.items-center.q-mt-sm
        div.col-6 Голосование:
        div.col-6.text-right
          VotingButtons(
            :decision="decision.table"
            :is-voted-for="isVotedFor"
            :is-voted-against="isVotedAgainst"
            :is-voted-any="isVotedAny"
            @vote-for="$emit('vote-for')"
            @vote-against="$emit('vote-against')"
          )

    q-card-actions(align="right")
      q-btn(size="sm" flat icon="expand_more" @click="$emit('toggle-expand')")
        | {{ expanded ? 'Скрыть' : 'Подробнее' }}
      q-btn(
        size="sm"
        color="teal"
        v-if="isChairman"
        :loading="isProcessing"
        @click="$emit('authorize')"
      )
        | Утвердить

    q-slide-transition
      div(v-show="expanded")
        q-separator
        q-card-section
          ComplexDocument(:documents="decision.documents")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ComplexDocument } from 'src/shared/ui/ComplexDocument'
import { formatToFromNow } from 'src/shared/lib/utils/dates/formatToFromNow'
import { VotingButtons } from '../VotingButtons'
import { useCurrentUserStore } from 'src/entities/User'
import type { IUser } from 'src/shared/lib/types/user'

defineProps({
  decision: {
    type: Object,
    required: true
  },
  expanded: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  isVotedFor: {
    type: Function,
    required: true
  },
  isVotedAgainst: {
    type: Function,
    required: true
  },
  isVotedAny: {
    type: Function,
    required: true
  }
})

defineEmits(['toggle-expand', 'authorize', 'vote-for', 'vote-against'])

const currentUser = useCurrentUserStore()
const isChairman = computed(() => currentUser.isChairman)

// Форматирование заголовка решения
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatDecisionTitle = (title: string, user: IUser) => {
  if (!title) return 'Без заголовка'
  if (title.length > 50) {
    return title.substring(0, 50) + '...'
  }
  return title
}
</script>
