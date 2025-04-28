<!-- BackButton.vue -->
<template lang="pug">
q-btn(
  v-if="backNavigationButton"
  stretch
  icon="fas fa-chevron-left"
  flat
  @click="backNavigationButton.onClick"
).back-button
  span.q-pl-sm {{ backNavigationButton.text }}
</template>

<script setup lang="ts">
import { useDesktopStore } from 'src/entities/Desktop/model'
import { computed } from 'vue'

const desktopStore = useDesktopStore()
const backNavigationButton = computed(() => desktopStore.backNavigationButton)
</script>

<style scoped lang="scss">
.back-button {
  min-width: auto;
}
</style>
