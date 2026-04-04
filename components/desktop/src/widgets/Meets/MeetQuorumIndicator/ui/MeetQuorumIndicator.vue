<template lang="pug">
.page-main-card.card-container.q-pa-lg
  .meet-quorum-head.q-mb-md
    .meet-quorum-title Явка
    .meet-quorum-line(aria-hidden='true')

  .row
    .col-12
      q-linear-progress.meet-quorum-progress(
        color='primary',
        :value='(meet.processing?.meet?.current_quorum_percent ?? 0) / 100',
        :buffer='(meet.processing?.meet?.quorum_percent ?? 0) / 100',
        track-color='grey-4',
        size='48px',
        rounded
      )
        .absolute-full.flex.flex-center
          .text-center
            .text-white.text-weight-medium.quorum-progress-label
              | {{ (Math.round((meet.processing?.meet?.current_quorum_percent ?? 0) * 10) / 10).toFixed(1) }}%
      .q-mt-md.full-width.text-center.text-caption.text-grey-7.quorum-hint
        | Собрание состоится при явке не менее {{ meet.processing?.meet?.quorum_percent ?? 0 }}% участников
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet';

defineProps<{
  meet: IMeet;
}>();
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.meet-quorum-head {
  text-align: center;
}

.meet-quorum-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.meet-quorum-line {
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

.meet-quorum-progress {
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);

  .body--dark &,
  .q-dark & {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  }
}

.quorum-progress-label {
  font-size: 20px;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.quorum-hint {
  line-height: 1.45;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}
</style>
