<template lang="pug">
div.row.q-pa-md
  div.col-12
    q-card(flat)
      q-card-section
        div.text-h6 Информация о собрании
        div.q-mt-sm
          div.row
            div.col-2.text-weight-bold Инициатор:
            div.col {{ meet.processing?.meet?.initiator }}
          div.row
            div.col-2.text-weight-bold Председатель:
            div.col {{ meet.processing?.meet?.presider }}
          div.row
            div.col-2.text-weight-bold Секретарь:
            div.col {{ meet.processing?.meet?.secretary }}
          div.row
            div.col-2.text-weight-bold Кворум:
            div.col {{ meet.processing?.meet?.quorum_percent }}%
          div.row
            div.col-2.text-weight-bold Текущий кворум:
            div.col {{ meet.processing?.meet?.current_quorum_percent }}%
          div.row
            div.col-2.text-weight-bold Кворум достигнут:
            div.col {{ meet.processing?.meet?.quorum_passed ? 'Да' : 'Нет' }}

      q-card-actions(v-if="canManage")
        q-btn(
          v-if="canClose"
          color="negative"
          label="Закрыть собрание"
          @click="$emit('close')"
        )
        q-btn(
          v-if="canRestart"
          color="primary"
          label="Перезапустить собрание"
          @click="$emit('restart')"
        )
</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'

defineProps<{
  meet: IMeet,
  canManage: boolean,
  canClose: boolean,
  canRestart: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'restart'): void
}>()
</script>
