<template lang="pug">
div(flat bordered).info-card.hover
  q-card(flat bordered).q-pa-md
    div.text-h6.q-mb-xs.full-width.text-center Явка

    div.row
      div.col-12
        q-linear-progress(
          :value="(meet.processing?.meet?.current_quorum_percent ?? 0) / 100"
          :buffer="(meet.processing?.meet?.quorum_percent ?? 0) / 100"
          track-color="lime"
          size="50px"
          rounded
        ).bg-grey
          div.absolute-full.flex.flex-center
            div.text-center
              div.text-white.text-weight-medium(style="font-size: 22px; line-height: 1.2;")
                | {{ meet.processing?.meet?.current_quorum_percent ?? 0 }}%
        div.q-mt-xs.full-width.text-center.text-caption.text-grey-7
          | Собрание состоится при явке не менее {{ meet.processing?.meet?.quorum_percent ?? 0 }}% участников


</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'

defineProps<{
  meet: IMeet
}>()
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';
</style>
