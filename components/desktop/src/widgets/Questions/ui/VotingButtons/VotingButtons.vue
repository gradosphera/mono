<template lang="pug">
div.buttons-container
  div.votes-group
    div.button-wrapper
      q-btn(v-if="isVotedFor(decision) || !isVotedAny(decision)" :disabled="isVotedAny(decision)" dense push @click="$emit('vote-against')").text-red
        q-icon(name="fa-regular fa-thumbs-down")
        span.vote-count {{decision.votes_against.length}}

      q-btn(v-if="isVotedAgainst(decision)" disabled dense push).text-red
        q-icon(name="fas fa-thumbs-down")
        span.vote-count {{decision.votes_against.length}}

    div.voters-list
      div.voter-name(v-for="certificate in decision.votes_against_certificates" :key="getVoterKey(certificate)") {{ getShortNameFromCertificate(certificate) }}

  q-checkbox(v-model="approved" disable size="lg" style="margin-top: -9px;").q-mx-xs

  div.votes-group
    div.button-wrapper
      q-btn(v-if="isVotedAgainst(decision) || !isVotedAny(decision)" :disabled="isVotedAny(decision)" dense push @click="$emit('vote-for')").text-green
        span.vote-count {{decision.votes_for.length}}
        q-icon(name="fa-regular fa-thumbs-up" style="transform: scaleX(-1)")

      q-btn(v-if="isVotedFor(decision)" disabled dense push).text-green
        span.vote-count {{decision.votes_for.length}}
        q-icon(name="fas fa-thumbs-up" style="transform: scaleX(-1)")

    div.voters-list
      div.voter-name(v-for="certificate in decision.votes_for_certificates" :key="getVoterKey(certificate)") {{ getShortNameFromCertificate(certificate) }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getShortNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate'

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

const getVoterKey = (certificate: any) => {
  if (certificate.username) return certificate.username
  if (certificate.first_name && certificate.last_name) {
    return `${certificate.last_name}_${certificate.first_name}`
  }
  if (certificate.short_name) return certificate.short_name
  return Math.random().toString()
}
</script>

<style scoped>
.buttons-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 150px;
}

.votes-group {
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-wrapper {
  height: 32px;
  display: flex;
  align-items: center;
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

.voters-list {
  margin-top: 4px;
  max-width: 100px;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.voter-name {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  margin-bottom: 2px;
  color: #666;
  word-wrap: break-word;
  hyphens: auto;
}
</style>
