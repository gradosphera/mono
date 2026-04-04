<template lang="pug">
.page-main-card.card-container.q-pa-lg
  .meet-section-head.q-mb-lg
    .meet-section-title Повестка
    .meet-section-line(aria-hidden='true')

  .info-card.q-mb-md(v-if='meetDetailsHtml')
    .text-body2.agenda-body(v-html='meetDetailsHtml')

  .agenda-item.info-card.q-mb-md(v-for='(item, index) in meetAgendaItems', :key='index')
    .row.items-start.no-wrap
      .col-auto.q-mr-md
        AgendaNumberAvatar(:number='index + 1')
      .col.min-w-0
        .text-body1.text-weight-medium.q-mb-sm {{ item.title }}

        .meet-field-row.q-mb-xs
          span.meet-field-label Проект решения
          span.meet-field-value {{ item.decision }}

        .meet-field-row
          span.meet-field-label Приложения
          span.meet-field-value(
            v-if='item.context',
            v-html='parseLinks(item.context)'
          )
          span.meet-field-value(v-else) —

  .row.justify-center.q-mt-lg
    SignNotificationButton(
      v-if='coopname && meetHash',
      :coopname='coopname',
      :meetHash='meetHash'
    )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IMeet } from 'src/entities/Meet';
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar';
import { SignNotificationButton } from 'src/features/Meet/SignNotification/ui';
import { parseLinks } from 'src/shared/lib/utils';

const props = defineProps<{
  meet: IMeet;
  coopname?: string;
  meetHash?: string;
}>();

const coopname = computed(() => props.coopname || '');
const meetHash = computed(() => props.meetHash || '');

const meetDetailsHtml = computed(() => {
  const raw = props.meet?.pre?.details?.trim();
  return raw ? parseLinks(raw) : '';
});

const meetAgendaItems = computed(() => {
  if (!props.meet) return [];
  return props.meet.processing?.questions || [];
});
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.meet-section-head {
  text-align: center;
}

.meet-section-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.meet-section-line {
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

.agenda-item .meet-field-value {
  word-break: break-word;
}

.meet-field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  opacity: 0.6;
  margin-bottom: 2px;
}

.meet-field-row .meet-field-label {
  margin-bottom: 4px;
}

.meet-field-value {
  font-size: 14px;
  line-height: 1.45;
  font-weight: 500;
}

.agenda-body :deep(a) {
  word-break: break-word;
}
</style>
