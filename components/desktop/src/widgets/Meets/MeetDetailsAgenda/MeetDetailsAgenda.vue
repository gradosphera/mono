<template lang="pug">
div
  div.row.justify-center
    SignNotificationButton(
      v-if="coopname && meetHash"
      :coopname="coopname"
      :meetHash="meetHash"
    )
  div.row.justify-center
    div.col-12.col-md-12(v-for="(item, index) in meetAgendaItems" :key="index")
      q-card(flat bordered)
        div.text-h6.q-mt-md.full-width.text-center Повестка

        q-card-section
          div.row.items-center
            div.col-auto.q-pa-md
              AgendaNumberAvatar(:number="item.number")
            div.col
              div.text-h6 {{ item.title }}
              div.text-body1 {{ item.context }}

</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar'
import { SignNotificationButton } from 'src/features/Meet/SignNotification/ui'

const props = defineProps<{
  meet: IMeet,
  coopname?: string,
  meetHash?: string
}>()

const coopname = computed(() => props.coopname || '')
const meetHash = computed(() => props.meetHash || '')

const meetAgendaItems = computed(() => {
  if (!props.meet) return []
  return props.meet.processing?.questions || []
})
</script>
