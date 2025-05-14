<template lang="pug">
q-item(flat clickable @click="toggleTheme")
  q-item-section
    q-item-label
      q-icon(:name="isDark ? 'brightness_7' : 'brightness_3'").q-mr-sm
      span(v-if="showText").btn-font {{ isDark ? 'ДНЕВНОЙ РЕЖИМ' : 'НОЧНОЙ РЕЖИМ' }}


</template>
<script setup lang="ts">

import { useQuasar } from 'quasar';
import { computed } from 'vue';
import { saveThemeToStorage } from 'src/shared/lib/utils';

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
    required: false
  },
  showText: {
    type: Boolean,
    default: false,
    required: false
  }
})

function toggleTheme() {
  $q.dark.toggle();
  saveThemeToStorage($q.dark.isActive);
}
</script>
<style scoped>
.btn-font {
  font-size: 10px !important;
}
</style>
