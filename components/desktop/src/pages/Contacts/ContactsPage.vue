<template lang="pug">
.q-pa-md
  .row
    .col-12
      q-card.page-main-card.q-pa-lg(flat)
        .page-header
          .page-icon
            q-icon(name='contacts', size='32px', color='primary')
          .page-title
            .title Контактная информация
            .subtitle {{ contacts?.full_name }}

  .row.q-mt-md
    // Левая колонка - Регистрационные данные
    .col-md-6.col-xs-12.q-pa-sm
      q-card.section-card.q-pa-lg(flat)
        .section-header
          .section-icon
            q-icon(name='business', size='24px', color='teal')
          .section-title Регистрационные данные

        .section-content
          .info-item
            .info-label ИНН
            .info-value {{ contacts?.details?.inn || 'Не указан' }}

          .info-item
            .info-label ОГРН
            .info-value {{ contacts?.details?.ogrn || 'Не указан' }}

    // Правая колонка - Контактные данные
    .col-md-6.col-xs-12.q-pa-sm
      q-card.section-card.q-pa-lg(flat)
        .section-header
          .section-icon
            q-icon(name='contact_mail', size='24px', color='teal')
          .section-title Контактные данные

        .section-content
          .info-item
            .info-label Юридический адрес
            .info-value {{ contacts?.full_address || 'Не указан' }}

          .info-item
            .info-label Телефон
            .info-value {{ contacts?.phone || 'Не указан' }}

          .info-item
            .info-label Электронная почта
            .info-value {{ contacts?.email || 'Не указан' }}

  // Совет (в отдельной строке)
  .row.q-mt-md(v-if='contacts?.chairman')
    .col-12.q-pa-sm
      q-card.section-card-warning.q-pa-lg(flat)
        .section-header
          .section-icon
            q-icon(name='person', size='24px', color='orange')
          .section-title Совет

        .section-content
          .info-item
            .info-label Председатель
            .info-value {{ chairman }}
</template>

<script lang="ts" setup>
import { useSystemStore } from 'src/entities/System/model';
import { computed } from 'vue';
import 'src/shared/ui/CardStyles';

const { info } = useSystemStore();

const contacts = computed(() => info.contacts);
const chairman = computed(
  () =>
    `${contacts.value?.chairman?.last_name} ${contacts.value?.chairman?.first_name} ${contacts.value?.chairman?.middle_name}`,
);
</script>
