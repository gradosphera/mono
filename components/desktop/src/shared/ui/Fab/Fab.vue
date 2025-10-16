<template lang="pug">
q-page-sticky(position="bottom-right" :offset="fabPos")
  // Если есть слот actions - рендерим раскрывающийся FAB
  q-fab(
    v-if="$slots.actions"
    icon="fa-solid fa-circle"
    direction="up"
    vertical-actions-align="right"
    :disable="draggingFab"
    v-touch-pan.prevent.mouse="moveFab"
    text-color="white"
    :class="`bg-fab-accent-radial ${fabClass || ''}`"
  )
    slot(name="actions")

  // Если есть слот default - рендерим содержимое слота как обычную кнопку
  div(v-else)
    slot
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { LocalStorage } from 'quasar'

const FAB_POSITION_KEY = 'fab-position'

// Восстанавливаем позицию из LocalStorage или используем дефолтную
const savedPos = LocalStorage.getItem(FAB_POSITION_KEY)
const fabPos = ref(Array.isArray(savedPos) ? savedPos : [18, 18])
const draggingFab = ref(false)

const moveFab = (ev: any) => {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

  fabPos.value = [
    fabPos.value[0] - ev.delta.x,
    fabPos.value[1] - ev.delta.y
  ]
}

// Сохраняем позицию в LocalStorage при изменении
watch(fabPos, (newPos) => {
  LocalStorage.set(FAB_POSITION_KEY, newPos)
}, { deep: true })

defineProps<{
  fabClass?: string;
}>();
</script>
