<template lang="pug">
div(flat).q-pa-md
  div.text-center.text-h5.q-mb-md Результаты собрания

  div.row.q-col-gutter-md.justify-center
    div.col-12.col-md-12(v-for="(item, index) in meetAgendaItems" :key="index")
      q-card(flat)
        q-card-section
          div.text-h6 {{ item.title }}
          q-separator.q-my-sm
          div.text-body1 {{ item.context }}
          q-separator.q-my-sm

          div.text-subtitle1.text-weight-bold Решение
          div.text-body2 {{ item.decision }}
          q-separator.q-my-sm

          div.text-subtitle1.text-weight-bold Результаты голосования
          div.row.q-col-gutter-sm.q-mt-sm
            div.col-4
              q-item
                q-item-section
                  div.text-weight-bold.text-positive ЗА
                  div.text-h6 {{ item.votes_for }}
            div.col-4
              q-item
                q-item-section
                  div.text-weight-bold.text-negative ПРОТИВ
                  div.text-h6 {{ item.votes_against }}
            div.col-4
              q-item
                q-item-section
                  div.text-weight-bold.text-grey ВОЗДЕРЖАЛИСЬ
                  div.text-h6 {{ item.votes_abstained }}

          div.text-subtitle1.text-weight-bold.q-mt-md Результат
          div.text-h6.q-mt-sm(:class="getResultClass(item)") {{ getResultText(item) }}
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'
import { computed } from 'vue'

const props = defineProps<{
  meet: IMeet
}>()

const meetAgendaItems = computed(() => {
  if (!props.meet || !props.meet.processed?.results) return []
  return props.meet.processed.results || []
})

// Получение текста результата
const getResultText = (question: any) => {
  if (question.accepted === undefined) return 'Нет данных'
  return question.accepted ? 'ПРИНЯТО' : 'ОТКЛОНЕНО'
}

// Получение класса для результата
const getResultClass = (question: any) => {
  if (question.accepted === undefined) return ''
  return question.accepted ? 'text-positive' : 'text-negative'
}
</script>
