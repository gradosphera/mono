<template lang="pug">
q-btn(flat @click="$q.dark.toggle()" stretch)
  q-icon(:name="isDark ? 'brightness_7' : 'brightness_3'").q-pt-xs
  p(v-if="showText").btn-font {{ isDark ? 'день' : 'ночь' }}
</template>
<script setup lang="ts">

import { useQuasar } from 'quasar';
import { computed } from 'vue';

const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)
defineProps({
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
