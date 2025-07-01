<template lang="pug">
.page-main-card.q-pa-lg
  MeetInfoCard(:meet='meet')
  // Слот для действий (кнопки)
  .wallet-actions.q-mt-lg(v-if='$slots.actions')
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

// Стили для кнопок, как в кошельке
.wallet-actions {
  .action-btn {
    border-radius: 10px;
    padding: 12px 0;
    font-weight: 500;
  }
}
</style>
