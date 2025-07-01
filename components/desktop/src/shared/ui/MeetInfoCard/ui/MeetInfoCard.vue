<template lang="pug">
div
  .text-h5.q-mb-lg.text-weight-medium.text-center.text-primary Общее собрание № {{ meet.processing?.meet?.id }}

  .row.q-col-gutter-md.items-stretch
    // Блок с датами
    .col-12.col-md-4
      .info-block.full-height
        .info-block-header
          q-icon(name='event', size='20px')
          .info-block-title Даты проведения
        .info-block-content
          .date-item
            .info-label Открытие
            .info-value {{ meetStatus.formattedOpenDate }} ({{ timezoneLabel }})
          .date-item.q-mt-md
            .info-label Закрытие
            .info-value {{ meetStatus.formattedCloseDate }} ({{ timezoneLabel }})

    // Блок с участниками
    .col-12.col-md-4
      .info-block.full-height
        .info-block-header
          q-icon(name='people', size='20px')
          .info-block-title Ведущие
        .info-block-content
          .info-label Председатель собрания:
          .info-value {{ getNameFromCertificate(meet.processing?.meet?.presider_certificate) || 'Не назначен' }}
          .q-mt-md
          .info-label Секретарь собрания:
          .info-value {{ getNameFromCertificate(meet.processing?.meet?.secretary_certificate) || 'Не назначен' }}

    // Блок с кворумом
    .col-12.col-md-4
      .info-block.full-height
        .info-block-header
          q-icon(name='pie_chart', size='20px')
          .info-block-title Явка и кворум
        .info-block-content
          .row
            .col-6.text-center
              .info-label Кворум
              .info-value.large {{ meet.processing?.meet?.quorum_percent }}%
            .col-6.text-center
              .info-label Явка
              .info-value.large {{ (Math.round((meet.processing?.meet?.current_quorum_percent ?? 0) * 10) / 10).toFixed(1) }}%
          .info-label.q-mt-md.text-center.text-caption Собрание состоится при явке не менее {{ meet.processing?.meet?.quorum_percent }}% пайщиков

  // Статус собрания
  .q-mt-lg
    MeetStatusBanner(:meet='meet')
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet';
import { useMeetStatus } from 'src/shared/lib/composables';
import { getNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { MeetStatusBanner } from 'src/shared/ui/MeetStatusBanner';
import { getTimezoneLabel } from 'src/shared/lib/utils/dates/timezone';

const props = defineProps<{
  meet: IMeet;
}>();

const timezoneLabel = getTimezoneLabel();
const meetStatus = useMeetStatus(props.meet);
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.info-block {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  .q-dark & {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .info-block-header {
    display: flex;
    align-items: center;
    color: $primary;
    margin-bottom: 16px;

    .info-block-title {
      font-size: 16px;
      font-weight: 500;
      margin-left: 8px;
    }
  }

  .info-label {
    font-size: 13px;
    opacity: 0.6;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 15px;
    font-weight: 500;

    &.large {
      font-size: 24px;
      font-weight: 600;
      color: $primary;
    }
  }
}
</style>
