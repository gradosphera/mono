<template lang="pug">
.color-card
  slot
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'teal';
}

const props = defineProps<Props>();

// Карта цветов для разных типов
const colorMap = {
  green: {
    base: '#4caf50',
    background: 'rgba(76, 175, 80, 0.08)',
    backgroundHover: 'rgba(76, 175, 80, 0.12)',
    backgroundDark: 'rgba(76, 175, 80, 0.15)',
    backgroundDarkHover: 'rgba(76, 175, 80, 0.22)',
    shadow: 'rgba(76, 175, 80, 0.2)',
  },
  blue: {
    base: '#1976d2',
    background: 'rgba(25, 118, 210, 0.08)',
    backgroundHover: 'rgba(25, 118, 210, 0.12)',
    backgroundDark: 'rgba(25, 118, 210, 0.15)',
    backgroundDarkHover: 'rgba(25, 118, 210, 0.22)',
    shadow: 'rgba(25, 118, 210, 0.2)',
  },
  orange: {
    base: '#ff9800',
    background: 'rgba(255, 152, 0, 0.08)',
    backgroundHover: 'rgba(255, 152, 0, 0.12)',
    backgroundDark: 'rgba(255, 152, 0, 0.15)',
    backgroundDarkHover: 'rgba(255, 152, 0, 0.22)',
    shadow: 'rgba(255, 152, 0, 0.2)',
  },
  red: {
    base: '#f44336',
    background: 'rgba(244, 67, 54, 0.08)',
    backgroundHover: 'rgba(244, 67, 54, 0.12)',
    backgroundDark: 'rgba(244, 67, 54, 0.15)',
    backgroundDarkHover: 'rgba(244, 67, 54, 0.22)',
    shadow: 'rgba(244, 67, 54, 0.2)',
  },
  purple: {
    base: '#9c27b0',
    background: 'rgba(156, 39, 176, 0.08)',
    backgroundHover: 'rgba(156, 39, 176, 0.12)',
    backgroundDark: 'rgba(156, 39, 176, 0.15)',
    backgroundDarkHover: 'rgba(156, 39, 176, 0.22)',
    shadow: 'rgba(156, 39, 176, 0.2)',
  },
  teal: {
    base: '#009688',
    background: 'rgba(0, 150, 136, 0.08)',
    backgroundHover: 'rgba(0, 150, 136, 0.12)',
    backgroundDark: 'rgba(0, 150, 136, 0.15)',
    backgroundDarkHover: 'rgba(0, 150, 136, 0.22)',
    shadow: 'rgba(0, 150, 136, 0.2)',
  },
};

const colors = computed(() => colorMap[props.color]);
</script>

<style lang="scss" scoped>
.color-card {
  border-radius: 12px;
  padding: 10px 10px 2px 10px;
  margin-bottom: 12px;
  border-left: 4px solid v-bind('colors.base');
  background: v-bind('colors.background');
  transition: all 0.2s ease;

  .q-dark & {
    background: v-bind('colors.backgroundDark');
  }

  &:hover {
    background: v-bind('colors.backgroundHover');
    transform: translateY(-2px);
    box-shadow: 0 4px 8px v-bind('colors.shadow');

    .q-dark & {
      background: v-bind('colors.backgroundDarkHover');
    }
  }

  .card-label {
    font-size: 12px;
    margin-bottom: 6px;
    opacity: 0.6;
  }

  .card-value {
    font-size: 16px;
    font-weight: 600;
    word-break: break-word;
  }
}
</style>
