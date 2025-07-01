<template lang="pug">
.page-main-card.q-pa-lg
  .text-center.text-h6.q-mb-md РЕЗУЛЬТАТЫ

  .row.justify-center.q-mb-md(v-if='!!meet?.processed?.decisionAggregate')
    ExpandableDocument(
      :documentAggregate='meet.processed.decisionAggregate',
      title='Протокол решения общего собрания пайщиков'
    )

  .info-item.q-mb-md(v-for='(item, index) in meetAgendaItems', :key='index')
    .row.items-start
      .col-auto.q-mr-md
        AgendaNumberAvatar(:number='item.number')
      .col
        .row.justify-between.items-center
          .text-h6.q-mb-sm {{ item.title }}
          q-badge.text-weight-bold(
            :color='getResultBadgeColor(item)',
            :label='getResultText(item)',
            :icon='getResultIcon(item)'
          )

        q-separator.q-my-md
        .text-body1(v-html='parseLinks(item.context)')

        .row.q-col-gutter-sm.q-mt-md
          .col-12.col-md-4
            .balance-card.balance-card-positive
              .balance-label ЗА
              .balance-value {{ item.votes_for }}
          .col-12.col-md-4
            .balance-card.balance-card-negative
              .balance-label ПРОТИВ
              .balance-value {{ item.votes_against }}
          .col-12.col-md-4
            .balance-card
              .balance-label ВОЗДЕРЖАЛИСЬ
              .balance-value {{ item.votes_abstained }}
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet';
import { computed } from 'vue';
import { ExpandableDocument } from 'src/shared/ui';
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar';
import { parseLinks } from 'src/shared/lib/utils';

const props = defineProps<{
  meet: IMeet;
}>();

const meetAgendaItems = computed(() => {
  if (!props.meet || !props.meet.processed?.results) return [];
  return props.meet.processed.results || [];
});

const getResultText = (question: any) => {
  if (question.accepted === undefined) return 'Нет данных';
  return question.accepted ? 'Принято' : 'Отклонено';
};

const getResultIcon = (question: any) => {
  if (question.accepted === undefined) return 'help_outline';
  return question.accepted ? 'check_circle' : 'cancel';
};

const getResultBadgeColor = (question: any) => {
  if (question.accepted === undefined) return 'grey-5';
  return question.accepted ? 'positive' : 'negative';
};
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.info-item {
  @extend .info-item; // из CardStyles
}

.balance-card {
  @extend .balance-card;
  text-align: center;

  &.balance-card-positive {
    background: rgba(76, 175, 80, 0.08);
    border-left: 4px solid #4caf50;
    .q-dark & {
      background: rgba(76, 175, 80, 0.15);
    }
  }

  &.balance-card-negative {
    background: rgba(244, 67, 54, 0.08);
    border-left: 4px solid #f44336;
    .q-dark & {
      background: rgba(244, 67, 54, 0.15);
    }
  }
}
</style>
