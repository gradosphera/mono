<template lang="pug">
div.meet-info-card-root
  .meet-info-title.q-mb-lg.text-center.text-primary
    | Общее собрание № {{ meet.processing?.meet?.id }}

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

.meet-info-card-root {
  .meet-info-title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
}

.info-block {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  background-color: color-mix(in srgb, var(--q-primary) 4%, var(--q-surface));
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  .body--dark &,
  .q-dark & {
    background-color: color-mix(
      in srgb,
      var(--q-dark-page, #1f1c1c) 88%,
      var(--q-primary) 12%
    );
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--q-primary) 22%, rgba(0, 0, 0, 0.08));

    .body--dark &,
    .q-dark & {
      border-color: color-mix(in srgb, var(--q-primary) 42%, rgba(255, 255, 255, 0.34));
    }
  }

  .info-block-header {
    display: flex;
    align-items: center;
    color: var(--q-primary);
    margin-bottom: 14px;

    .info-block-title {
      font-size: 15px;
      font-weight: 600;
      margin-left: 8px;
    }
  }

  .info-label {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    opacity: 0.6;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word;

    &.large {
      font-size: 22px;
      font-weight: 600;
      color: var(--q-primary);
      letter-spacing: -0.02em;
    }
  }
}
</style>
