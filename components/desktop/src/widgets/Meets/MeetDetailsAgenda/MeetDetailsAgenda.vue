<template lang="pug">
div(flat)
  div.text-center.text-h6.q-mb-md Повестка
  div.row.justify-center
    div.col-12.col-md-12(v-for="(item, index) in meetAgendaItems" :key="index")
      q-card(flat bordered)
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

const props = defineProps<{
  meet: IMeet
}>()

const meetAgendaItems = computed(() => {
  if (!props.meet) return []
  return props.meet.processing?.questions || []
})
</script>
