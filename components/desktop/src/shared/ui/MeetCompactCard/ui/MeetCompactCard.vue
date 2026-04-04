<template lang="pug">
.meet-compact-card.q-pa-lg(
  role='button',
  tabindex='0',
  @click='$emit("navigate")',
  @keydown.enter.prevent='$emit("navigate")',
  @keydown.space.prevent='$emit("navigate")'
)
  .meet-header.q-mb-md
    .row.items-center.justify-between
      .col-auto.flex.items-center
        .meet-icon-wrap.q-mr-md(aria-hidden='true')
          q-icon(name='event', size='24px', color='primary')
        .meet-info
          .meet-title Общее собрание № {{ meet.processing?.meet?.id }}

  .meet-body.q-mb-md
    .row.q-col-gutter-sm
      .col-md-6.col-xs-12
        .meet-stat-tile
          .meet-stat-label Открытие
          .meet-stat-value {{ meetStatus.formattedOpenDate }} {{ getTimezoneLabel() }}
      .col-md-6.col-xs-12
        .meet-stat-tile
          .meet-stat-label Закрытие
          .meet-stat-value {{ meetStatus.formattedCloseDate }} {{ getTimezoneLabel() }}
  .meet-status-row
    MeetStatusBanner(:meet='meet')

  .row.q-mt-md.items-center
    .col-auto
      q-btn(
        color='primary',
        icon='arrow_forward',
        label='Подробнее',
        flat,
        dense,
        no-caps,
        @click.stop='$emit("navigate")'
      )
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet';
import { useMeetStatus } from 'src/shared/lib/composables';

import { getTimezoneLabel } from 'src/shared/lib/utils/dates';
import { MeetStatusBanner } from 'src/shared/ui/MeetStatusBanner';

const props = defineProps<{
  meet: IMeet;
}>();

defineEmits<{
  navigate: [];
}>();

const meetStatus = useMeetStatus(props.meet);
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.meet-compact-card {
  @extend .card-container;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  // Тёмная тема: без «засвета» от белой плёнки — опора на фон страницы + лёгкий primary
  .body--dark &,
  .q-dark & {
    background-color: color-mix(
      in srgb,
      var(--q-dark-page, #1f1c1c) 92%,
      var(--q-primary) 8%
    );
  }

  &:hover {
    border-color: color-mix(in srgb, var(--q-primary) 28%, rgba(0, 0, 0, 0.08));
    box-shadow: 0 2px 12px color-mix(in srgb, var(--q-primary) 14%, transparent);

    // Тёмная тема: граница + тень + лёгкий сдвиг фона к primary (слабее, чем раньше)
    .body--dark &,
    .q-dark & {
      border-color: color-mix(in srgb, var(--q-primary) 35%, rgba(255, 255, 255, 0.72));
      background-color: color-mix(
        in srgb,
        var(--q-dark-page, #1f1c1c) 90%,
        var(--q-primary) 10%
      );
      box-shadow: 0 2px 16px color-mix(in srgb, var(--q-primary) 18%, transparent);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--q-primary) 55%, transparent);
    outline-offset: 2px;
  }

  .meet-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--q-primary) 10%, transparent);
  }

  .meet-header {
    .meet-info {
      .meet-title {
        font-size: 18px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--q-primary);
      }
    }
  }

  .meet-stat-tile {
    border-radius: 12px;
    padding: 12px 14px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: color-mix(in srgb, var(--q-primary) 6%, var(--q-surface));

    .body--dark &,
    .q-dark & {
      border-color: rgba(255, 255, 255, 0.28);
      background: color-mix(
        in srgb,
        var(--q-dark-page, #1f1c1c) 88%,
        var(--q-primary) 12%
      );
    }
  }

  .meet-stat-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    opacity: 0.6;
    margin-bottom: 4px;
  }

  .meet-stat-value {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    word-break: break-word;
  }

  .meet-status-row {
    width: 100%;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .meet-compact-card {
    .meet-header {
      .row {
        flex-direction: column;
        gap: 16px;
      }
    }

    .meet-body {
      .row {
        flex-direction: column;
      }
    }
  }
}
</style>
