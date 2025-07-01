<template lang="pug">
.page-main-card.q-pa-lg
  .text-h6.q-mb-md.full-width.text-center Явка

  .row
    .col-12
      q-linear-progress.bg-grey(
        :value='(meet.processing?.meet?.current_quorum_percent ?? 0) / 100',
        :buffer='(meet.processing?.meet?.quorum_percent ?? 0) / 100',
        track-color='lime',
        size='50px',
        rounded
      )
        .absolute-full.flex.flex-center
          .text-center
            .text-white.text-weight-medium(
              style='font-size: 22px; line-height: 1.2'
            )
              | {{ (Math.round((meet.processing?.meet?.current_quorum_percent ?? 0) * 10) / 10).toFixed(1) }}%
      .q-mt-md.full-width.text-center.text-caption.text-grey-7
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

.q-linear-progress {
  border-radius: 12px;
}
</style>
