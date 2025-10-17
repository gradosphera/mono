<!-- BackButton.vue -->
<template lang="pug">
q-btn.back-button(
  stretch,
  v-if='backNavigationButton',
  flat
  color='secondary',
  @click='backNavigationButton.onClick'
)
  i.fa-solid.fa-chevron-left
  span.q-pl-sm(v-if='!isMobile') {{ backNavigationButton.text }}
</template>
<script setup lang="ts">
import { useDesktopStore } from 'src/entities/Desktop/model';
import { computed } from 'vue';
import { useWindowSize } from 'src/shared/hooks';
// import { Dark } from 'quasar';

const { isMobile } = useWindowSize();
const desktopStore = useDesktopStore();
const backNavigationButton = computed(() => desktopStore.backNavigationButton);

// Цвет кнопки в зависимости от темы
// const backButtonColor = computed(() => Dark.isActive ? 'grey-10' : 'grey-9');
</script>

<style scoped lang="scss">
.back-button {
  min-width: auto;
}
</style>
