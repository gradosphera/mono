<template lang="pug">
.page-main-card.q-pa-lg
  .text-h6.q-mb-md.full-width.text-center Повестка

  .info-item.q-mb-md(v-for='(item, index) in meetAgendaItems', :key='index')
    .row.items-start
      .col-auto.q-mr-md
        AgendaNumberAvatar(:number='index + 1')
      .col
        .text-body1.text-weight-medium.q-mb-md {{ item.title }}

        .text-caption.q-mb-sm
          span.text-weight-bold Проект решения:
          span.q-ml-xs {{ item.decision }}

        .text-caption
          span.text-weight-bold Приложения:
          span.q-ml-xs(v-if='item.context', v-html='parseLinks(item.context)')
          span.q-ml-xs(v-else) —

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

const meetAgendaItems = computed(() => {
  if (!props.meet) return [];
  return props.meet.processing?.questions || [];
});
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.info-item {
  @extend .info-item;
}
</style>
