<template lang="pug">
// Вариант для хедера (кнопка)
q-btn(
  v-if='asButton',
  flat,
  stretch,
  :icon='isDark ? "brightness_7" : "brightness_3"',
  @click='toggleTheme',
  :size='isMobile ? "sm" : "md"'
)
  q-tooltip {{ isDark ? 'Светлая тема' : 'Темная тема' }}

// Вариант для списка (элемент списка)
q-item(v-else, flat, clickable, @click='toggleTheme')
  q-item-section
    q-item-label
      q-icon.q-mr-sm(:name='isDark ? "brightness_7" : "brightness_3"')
      span.btn-font(v-if='showText') {{ isDark ? 'ДНЕВНОЙ РЕЖИМ' : 'НОЧНОЙ РЕЖИМ' }}
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed } from 'vue';
import { saveThemeToStorage, updatePWAThemeColor } from 'src/shared/lib/utils';

const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
    required: false,
  },
  showText: {
    type: Boolean,
    default: false,
    required: false,
  },
  asButton: {
    type: Boolean,
    default: false,
    required: false,
  },
});

function toggleTheme() {
  $q.dark.toggle();
  saveThemeToStorage($q.dark.isActive);
  updatePWAThemeColor($q.dark.isActive);
}
</script>
<style scoped>
.btn-font {
  font-size: 10px !important;
}
</style>
