<template lang="pug">
div.row.no-wrap
  q-btn(v-if="isVotedFor(decision) || !isVotedAny(decision)" :disabled="isVotedAny(decision)" dense flat @click="$emit('vote-against')").text-red
    q-icon(name="fa-regular fa-thumbs-down")
    span.q-pl-xs {{decision.votes_against.length}}

  q-btn(v-if="isVotedAgainst(decision)" disabled dense flat).text-red
    q-icon(name="fas fa-thumbs-down")
    span.q-pl-xs {{decision.votes_against.length}}

  q-checkbox( v-model="approved" disable :true-value="1" :false-value="0" )

  q-btn(v-if="isVotedAgainst(decision) || !isVotedAny(decision)" :disabled="isVotedAny(decision)" dense flat @click="$emit('vote-for')").text-green
    span.q-pr-xs {{decision.votes_for.length}}
    q-icon(name="fa-regular fa-thumbs-up" style="transform: scaleX(-1)")

  q-btn(v-if="isVotedFor(decision)" disabled dense flat ).text-green
    span.q-pr-xs {{decision.votes_for.length}}
    q-icon(name="fas fa-thumbs-up" style="transform: scaleX(-1)")
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  decision: {
    type: Object,
    required: true
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

defineEmits(['vote-for', 'vote-against'])

const approved = computed(() => props.decision.approved)
</script>
