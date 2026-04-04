<template lang="pug">
.meet-details-results
  .page-main-card.card-container.q-pa-lg
    .meet-results-head.q-mb-lg
      .meet-results-title РЕЗУЛЬТАТЫ
      .meet-results-line(aria-hidden='true')

    .result-item.info-card.q-mb-md(
      v-for='(item, index) in meetAgendaItems',
      :key='index'
    )
      .result-question-layout
        .result-question-layout__badge
          AgendaNumberAvatar(:number='item.number')
        .result-question-layout__content
          .text-body1.text-weight-medium.result-item-title.q-mb-sm {{ item.title }}

          .result-item-context.q-mb-md(
            v-if='item.context',
            v-html='parseLinks(item.context)'
          )

          .result-outcome-panel.q-mb-md(:class='getOutcomePanelClass(item)')
            .result-outcome-panel__head
              span.result-outcome-panel__label Решение
              q-badge.text-weight-bold(
                :color='getResultBadgeColor(item)',
                :label='getResultText(item)',
                :icon='getResultIcon(item)'
              )
            .result-outcome-panel__decision(v-if='item.decision') {{ item.decision }}

          .row.q-col-gutter-sm
            .col-12.col-md-4
              .vote-stat.vote-stat--for
                .vote-stat-label ЗА
                .vote-stat-value {{ item.votes_for }}
            .col-12.col-md-4
              .vote-stat.vote-stat--against
                .vote-stat-label ПРОТИВ
                .vote-stat-value {{ item.votes_against }}
            .col-12.col-md-4
              .vote-stat.vote-stat--neutral
                .vote-stat-label ВОЗДЕРЖАЛИСЬ
                .vote-stat-value {{ item.votes_abstained }}


  .meet-protocol-card__body
    ExpandableDocument(
      v-if="protocolDocumentAggregate"
      :documentAggregate='protocolDocumentAggregate',
      title='Протокол решения общего собрания пайщиков'
    ).q-mt-lg
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

const protocolDocumentAggregate = computed(
  () => props.meet?.processed?.decisionAggregate ?? null,
);

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

const getOutcomePanelClass = (question: any) => {
  if (question.accepted === undefined) return 'result-outcome-panel--unknown';
  return question.accepted
    ? 'result-outcome-panel--accepted'
    : 'result-outcome-panel--rejected';
};
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.meet-results-head {
  text-align: center;
}

.meet-results-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.meet-results-line {
  height: 3px;
  width: 48px;
  margin: 0 auto;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--q-primary) 70%, transparent),
    color-mix(in srgb, var(--q-secondary) 70%, transparent)
  );
}

.result-item-title {
  line-height: 1.35;
  word-break: break-word;
}

.result-question-layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.result-question-layout__badge {
  flex-shrink: 0;
  line-height: 0;
}

.result-question-layout__content {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 599px) {
  .result-question-layout {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.result-item-context {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  opacity: 0.82;
  word-break: break-word;

  :deep(a) {
    word-break: break-word;
  }
}

.result-outcome-panel {
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-left-width: 3px;
}

.result-outcome-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin-bottom: 8px;
}

.result-outcome-panel__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--q-primary);
  opacity: 0.95;
}

.result-outcome-panel__decision {
  font-size: 14px;
  line-height: 1.45;
  font-weight: 500;
  word-break: break-word;
}

.result-outcome-panel--accepted {
  border-left-color: var(--q-positive, #21ba45);
  background-color: color-mix(in srgb, var(--q-positive, #21ba45) 9%, #ffffff);
}

.result-outcome-panel--rejected {
  border-left-color: var(--q-negative, #c10015);
  background-color: color-mix(in srgb, var(--q-negative, #c10015) 8%, #ffffff);
}

.result-outcome-panel--unknown {
  border-left-color: var(--q-primary);
  background-color: color-mix(in srgb, var(--q-primary) 8%, #ffffff);
}

.body--dark .result-outcome-panel--accepted,
.q-dark .result-outcome-panel--accepted {
  background-color: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 14%,
    var(--q-dark-page, #1f1c1c)
  );
  border-color: color-mix(in srgb, var(--q-positive, #21ba45) 28%, rgba(255, 255, 255, 0.15));
  border-left-color: var(--q-positive, #21ba45);
}

.body--dark .result-outcome-panel--rejected,
.q-dark .result-outcome-panel--rejected {
  background-color: color-mix(
    in srgb,
    var(--q-negative, #c10015) 14%,
    var(--q-dark-page, #1f1c1c)
  );
  border-color: color-mix(in srgb, var(--q-negative, #c10015) 28%, rgba(255, 255, 255, 0.15));
  border-left-color: var(--q-negative, #c10015);
}

.body--dark .result-outcome-panel--unknown,
.q-dark .result-outcome-panel--unknown {
  background-color: color-mix(
    in srgb,
    var(--q-primary) 12%,
    var(--q-dark-page, #1f1c1c)
  );
  border-color: rgba(255, 255, 255, 0.2);
  border-left-color: var(--q-primary);
}

.result-votes-caption {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.65;
}

.meet-protocol-card__body {
  :deep(.expandable-document) {
    margin-bottom: 0;
    border-radius: 10px;
    border-color: rgba(0, 0, 0, 0.08);
  }

  :deep(.expandable-document .document-header) {
    border-radius: 10px;
  }
}

.body--dark .meet-protocol-card__body :deep(.expandable-document),
.q-dark .meet-protocol-card__body :deep(.expandable-document) {
  border-color: rgba(255, 255, 255, 0.2);
}

.vote-stat {
  text-align: center;
  border-radius: 12px;
  padding: 14px 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);

  .body--dark &,
  .q-dark & {
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.vote-stat-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  opacity: 0.6;
  margin-bottom: 6px;
}

.vote-stat-value {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.vote-stat--for {
  background: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 10%,
    var(--q-surface)
  );
  border-left: 3px solid var(--q-positive, #21ba45);

  .body--dark &,
  .q-dark & {
    background: color-mix(
      in srgb,
      var(--q-positive, #21ba45) 18%,
      rgba(255, 255, 255, 0.06)
    );
  }
}

.vote-stat--against {
  background: color-mix(in srgb, var(--q-negative, #c10015) 10%, var(--q-surface));
  border-left: 3px solid var(--q-negative, #c10015);

  .body--dark &,
  .q-dark & {
    background: color-mix(
      in srgb,
      var(--q-negative, #c10015) 18%,
      rgba(255, 255, 255, 0.06)
    );
  }
}

.vote-stat--neutral {
  background: color-mix(in srgb, var(--q-primary) 6%, var(--q-surface));
  border-left: 3px solid color-mix(in srgb, var(--q-primary) 55%, transparent);

  .body--dark &,
  .q-dark & {
    background: color-mix(in srgb, var(--q-primary) 12%, rgba(255, 255, 255, 0.06));
  }
}
</style>
