<template lang="pug">
div
  q-card(flat bordered).q-pa-md
    MeetInfoCard(:meet="meet")
    // Слот для действий (кнопки)
    div.q-mt-md(v-if="$slots.actions")
      slot(name="actions")
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
