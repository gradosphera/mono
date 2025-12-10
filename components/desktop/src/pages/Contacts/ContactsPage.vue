<template lang="pug">
.contacts-page.q-pa-lg
  .page-header.q-mb-lg
    .eyebrow Контактные данные
    .title {{ contacts?.full_name || 'Организация' }}

  .row.q-col-gutter-md.q-mb-md(v-if='chairman')
    .col-12
      ColorCard(color='orange')
        .card-section.chairman-card
          .card-section-title Председатель совета
          .info-list
            .info-row
              .label ФИО
              .value {{ chairman }}

  .row.q-col-gutter-md.q-mb-md
    .col-md-4.col-sm-6.col-12
      ColorCard(color='indigo')
        .card-section
          .card-section-title Регистрационные данные
          .info-list
            .info-row
              .label ИНН
              .value {{ displayValue(contacts?.details?.inn) }}
            .info-row
              .label ОГРН
              .value {{ displayValue(contacts?.details?.ogrn) }}

    .col-md-4.col-sm-6.col-12
      ColorCard(color='teal')
        .card-section
          .card-section-title Контакты
          .info-list
            .info-row
              .label Телефон
              .value {{ displayValue(contacts?.phone) }}
            .info-row
              .label Электронная почта
              .value {{ displayValue(contacts?.email) }}

    .col-md-4.col-sm-12.col-12
      ColorCard(color='blue')
        .card-section
          .card-section-title Адрес
          .info-list
            .info-row
              .label Юридический адрес
              .value {{ displayValue(contacts?.full_address) }}
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import ColorCard from 'src/shared/ui/ColorCard/ui/ColorCard.vue';
import { useSystemStore } from 'src/entities/System/model';

const { info } = useSystemStore();

const contacts = computed(() => info.contacts);

const chairman = computed(() => {
  const chair = contacts.value?.chairman;
  if (!chair) {
    return '';
  }
  return [chair.last_name, chair.first_name, chair.middle_name].filter(Boolean).join(' ');
});

const displayValue = (value?: string | null) => value || '—';
</script>

<style scoped>
.contacts-page {
  width: 100%;
}

.page-header {
  display: grid;
  gap: 4px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
  opacity: 0.7;
}

.title {
  font-size: 24px;
  font-weight: 700;
}

.card-section {
  display: grid;
  gap: 8px;
}

.card-section-title {
  font-weight: 600;
  font-size: 14px;
}

.info-list {
  display: grid;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
}

.label {
  font-size: 12px;
  opacity: 0.7;
}

.value {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.q-dark .info-row {
  background: rgba(255, 255, 255, 0.04);
}

.chairman-card .info-row {
  background: rgba(255, 152, 0, 0.08);
}
</style>
