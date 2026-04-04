<template lang="pug">
.page-main-card.card-container.q-pa-lg
  MeetInfoCard(:meet='meet')
  .meet-details-actions.q-mt-lg(v-if='$slots.actions')
    slot(name='actions')
</template>

<script setup lang="ts">
import { MeetInfoCard } from 'src/shared/ui/MeetInfoCard';
import type { IMeet } from 'src/entities/Meet';

defineProps<{
  meet: IMeet;
}>();
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

.meet-details-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
