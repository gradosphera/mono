<template lang="pug">
q-card(flat class="card-container q-pa-md")
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
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'
import { computed } from 'vue'

const props = defineProps<{
  meet: IMeet
}>()

const meetAgendaItems = computed(() => {
  if (!props.meet) return []
  return props.meet.processing?.questions || []
})
</script> 