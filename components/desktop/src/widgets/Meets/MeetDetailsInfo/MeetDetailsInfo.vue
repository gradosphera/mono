<template lang="pug">
div.info-card
  div.row
    div.col-12
      div.text-h5.q-mb-xs Общее собрание № {{ meet.processing?.meet?.id }}
  MeetInfoCard(:meet="meet").q-mt-lg

</template>

<script setup lang="ts">
import { MeetInfoCard } from 'src/shared/ui/MeetInfoCard'
import type { IMeet } from 'src/entities/Meet'

defineProps<{
  meet: IMeet
}>()

</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.meet-status {
  font-size: 14px;
  padding: 4px 8px;
}
</style>
