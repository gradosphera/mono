<template lang="pug">
div(flat)
  div.text-center.text-h6.q-mb-md РЕЗУЛЬТАТЫ

  div.row.justify-center
    // Отображаем документ собрания, если он есть
    ExpandableDocument(
      v-if="!!meet?.processed?.decisionAggregate"
      :documentAggregate="meet.processed.decisionAggregate"
      title="Протокол решения общего собрания пайщиков"
    )
    div.col-12.col-md-12(v-for="(item, index) in meetAgendaItems" :key="index")
      q-card(flat bordered).q-mb-md
        q-card-section
          div.row
            div.col-12.col-md-auto.flex.justify-center.q-pa-md
              AgendaNumberAvatar(:number="item.number")
            div.col-12.col-md

              div.row.justify-between.items-center
                div.text-h6 {{ item.title }}
                q-badge(
                  :color="getResultBadgeColor(item)"
                  :label="getResultText(item)"
                  :icon="getResultIcon(item)"
                  floating
                  class="text-weight-bold"
                )

              q-separator.q-my-sm
              div.text-body1 {{ item.context }}
              q-separator.q-my-sm

              //- div.text-subtitle1.text-weight-bold Решение
              //- div.text-body2 {{ item.decision }}
              //- q-separator.q-my-sm

              div.row.q-col-gutter-sm.q-mt-sm
                // Новый push-дизайн карточек голосования
                div.col-12.col-md-4
                  q-card(flat bordered :class="'q-pa-md q-mb-sm shadow-2 flex flex-center ' + getCardClass('for')")
                    q-card-section(class="text-center")
                      q-icon(name="thumb_up" :color="getCardSemanticColor('for')" size="32px")
                      div(:class="'text-weight-bold q-mt-sm text-' + getCardSemanticColor('for')") ЗА
                      div(:class="'text-h5 q-mt-xs text-' + getCardSemanticColor('for')") {{ item.votes_for }}
                div.col-12.col-md-4
                  q-card(flat bordered :class="'q-pa-md q-mb-sm shadow-2 flex flex-center ' + getCardClass('against')")
                    q-card-section(class="text-center")
                      q-icon(name="thumb_down" :color="getCardSemanticColor('against')" size="32px")
                      div(:class="'text-weight-bold q-mt-sm text-' + getCardSemanticColor('against')") ПРОТИВ
                      div(:class="'text-h5 q-mt-xs text-' + getCardSemanticColor('against')") {{ item.votes_against }}


                div.col-12.col-md-4
                  q-card(flat bordered :class="'q-pa-md q-mb-sm shadow-2 flex flex-center ' + getCardClass('abstained')")
                    q-card-section(class="text-center")
                      q-icon(name="pan_tool" :color="getCardSemanticColor('abstained')" size="32px")
                      div(:class="'text-weight-bold q-mt-sm text-' + getCardSemanticColor('abstained')") ВОЗДЕРЖАЛИСЬ
                      div(:class="'text-h5 q-mt-xs text-' + getCardSemanticColor('abstained')") {{ item.votes_abstained }}
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'
import { computed } from 'vue'
import { ExpandableDocument } from 'src/shared/ui'
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)

const props = defineProps<{
  meet: IMeet
}>()

const meetAgendaItems = computed(() => {
  if (!props.meet || !props.meet.processed?.results) return []
  return props.meet.processed.results || []
})

// Классы для карточек голосования с учётом темы
const getCardClass = (type: 'for' | 'against' | 'abstained') => {
  if (type === 'for') return isDark.value ? 'bg-green-10 card-border-light' : 'bg-green-1'
  if (type === 'against') return isDark.value ? 'bg-red-10 card-border-light' : 'bg-red-1'
  if (type === 'abstained') return isDark.value ? 'bg-grey-9 card-border-light' : 'bg-grey-2'
  return ''
}

// Цвет иконки и текста для карточки с учетом темы
const getCardSemanticColor = (type: 'for' | 'against' | 'abstained') => {
  if (isDark.value) {
    // В темной теме используем светлые цвета для контраста
    if (type === 'for') return 'green-3'
    if (type === 'against') return 'red-3'
    if (type === 'abstained') return 'grey-4'
  } else {
    // В светлой теме используем стандартные цвета
    if (type === 'for') return 'positive'
    if (type === 'against') return 'negative'
    if (type === 'abstained') return 'grey'
  }
  return ''
}

// Получение текста результата
const getResultText = (question: any) => {
  if (question.accepted === undefined) return 'Нет данных'
  return question.accepted ? 'ПРИНЯТО' : 'ОТКЛОНЕНО'
}

// Добавляю функции для иконки и цвета результата
const getResultIcon = (question: any) => {
  if (question.accepted === undefined) return 'help_outline'
  return question.accepted ? 'check_circle' : 'cancel'
}

const getResultBadgeColor = (question: any) => {
  if (question.accepted === undefined) return 'grey-5'
  return question.accepted ? 'positive' : 'negative'
}
</script>

<style scoped>
/* Светлая рамка для карточек в тёмном режиме */
.card-border-light {
  border: 1.5px solid #fff2;
}
</style>
