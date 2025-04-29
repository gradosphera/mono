<template lang="pug">
q-card(flat class="card-container q-pa-md")
  div.row.items-center
    div.col-12
      div.text-h5.q-mb-xs Общее собрание {{ meet.hash.substring(0, 10) }}
      q-badge(color="primary" class="meet-status") {{ meetStatus }}
  div.row.q-mt-md
    div.col-12
      MeetInfoCard(:meet="meet")
</template>

<script setup lang="ts">
import { MeetInfoCard } from '../MeetInfoCard'
import type { IMeet } from 'src/entities/Meet'
import { computed } from 'vue';

const props = defineProps<{
  meet: IMeet
}>()

const meetStatus = computed(() => {
  if (!props.meet?.processing?.meet?.status) return 'Неизвестный статус'
  
  const statusMap = {
    'created': 'Ожидание решения совета',
    'authorized': 'Утверждено',
    'preclose': 'На закрытии',
    'closed': 'Закрыто'
  }
  
  return statusMap[props.meet.processing.meet.status] || 'Неизвестный статус'
})
</script>

<style lang="scss" scoped>
.meet-status {
  font-size: 14px;
  padding: 4px 8px;
}
</style> 