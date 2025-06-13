<template lang="pug">
div
  div.row.justify-center
    div.text-h6.q-mt-md.full-width.text-center Повестка

    div.col-12.col-md-12(v-for="(item, index) in meetAgendaItems" :key="index")
      q-card(flat bordered).q-mb-md.q-mt-md.q-pt-md
        q-card-section.q-pa-xs
          div.q-mb-xs.flex.items-start.q-mb-lg.q-pa-xs
            AgendaNumberAvatar(:number="index + 1" class="q-ma-md")
            div.col
              div.text-body1.text-weight-medium.q-mb-2 {{ item.title }}
              div.text-caption.q-mb-1.q-mt-md
                span.text-weight-bold Проект решения:
                span.q-ml-xs {{ item.decision }}
              div.text-caption.q-mt-md
                span.text-weight-bold Приложения:
                span.q-ml-xs(v-if="item.context" v-html="parseLinks(item.context)")
                span.q-ml-xs(v-else) —
  div.row.justify-center
    SignNotificationButton(
      v-if="coopname && meetHash"
      :coopname="coopname"
      :meetHash="meetHash"
    )
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar'
import { SignNotificationButton } from 'src/features/Meet/SignNotification/ui'
import { parseLinks } from 'src/shared/lib/utils'

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
