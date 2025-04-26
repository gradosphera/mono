<template lang="pug">
div.buttons-container
  div.votes-group
    q-btn(v-if="isVotedFor(decision) || !isVotedAny(decision)" :disabled="isVotedAny(decision)" dense flat @click="$emit('vote-against')").text-red
      q-icon(name="fa-regular fa-thumbs-down")
      span.vote-count {{decision.votes_against.length}}

    q-btn(v-if="isVotedAgainst(decision)" disabled dense flat).text-red
      q-icon(name="fas fa-thumbs-down")
      span.vote-count {{decision.votes_against.length}}

  q-checkbox(v-model="approved" disable).q-mx-xs

  div.votes-group
    q-btn(v-if="isVotedAgainst(decision) || !isVotedAny(decision)" :disabled="isVotedAny(decision)" dense flat @click="$emit('vote-for')").text-green
      span.vote-count {{decision.votes_for.length}}
      q-icon(name="fa-regular fa-thumbs-up" style="transform: scaleX(-1)")

    q-btn(v-if="isVotedFor(decision)" disabled dense flat).text-green
      span.vote-count {{decision.votes_for.length}}
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

<style scoped>
.buttons-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
}

.votes-group {
  width: 60px;
  display: flex;
  justify-content: center;
}

.vote-count {
  min-width: 25px;
  display: inline-block;
  text-align: center;
}

.q-btn {
  min-width: 60px;
  height: 32px;
}
</style>
