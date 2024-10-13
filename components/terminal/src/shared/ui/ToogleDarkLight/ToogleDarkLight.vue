<template lang="pug">
q-btn(:size="isMobile ? 'sm' : 'md'" :dense="isMobile" flat @click="$q.dark.toggle()" stretch)
  q-icon(:name="isDark ? 'brightness_7' : 'brightness_3'").q-pt-xs
  p(v-if="showText").btn-font {{ isDark ? 'день' : 'ночь' }}
</template>
<script setup lang="ts">

import { useQuasar } from 'quasar';
import { computed } from 'vue';

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
</script>
<style scoped>
.btn-font {
  font-size: 7px !important;
}
</style>
