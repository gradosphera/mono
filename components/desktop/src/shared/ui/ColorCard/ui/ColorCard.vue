<template lang="pug">
.color-card
  slot
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'teal' | 'grey' | 'indigo' | 'cyan' | 'pink';
  transparent?: boolean;
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
  grey: {
    base: '#9e9e9e',
    background: 'rgba(158, 158, 158, 0.08)',
    backgroundHover: 'rgba(158, 158, 158, 0.12)',
    backgroundDark: 'rgba(158, 158, 158, 0.15)',
    backgroundDarkHover: 'rgba(158, 158, 158, 0.22)',
    shadow: 'rgba(158, 158, 158, 0.2)',
  },
  indigo: {
    base: '#3f51b5',
    background: 'rgba(63, 81, 181, 0.08)',
    backgroundHover: 'rgba(63, 81, 181, 0.12)',
    backgroundDark: 'rgba(63, 81, 181, 0.15)',
    backgroundDarkHover: 'rgba(63, 81, 181, 0.22)',
    shadow: 'rgba(63, 81, 181, 0.2)',
  },
  cyan: {
    base: '#00bcd4',
    background: 'rgba(0, 188, 212, 0.08)',
    backgroundHover: 'rgba(0, 188, 212, 0.12)',
    backgroundDark: 'rgba(0, 188, 212, 0.15)',
    backgroundDarkHover: 'rgba(0, 188, 212, 0.22)',
    shadow: 'rgba(0, 188, 212, 0.2)',
  },
  pink: {
    base: '#e91e63',
    background: 'rgba(233, 30, 99, 0.08)',
    backgroundHover: 'rgba(233, 30, 99, 0.12)',
    backgroundDark: 'rgba(233, 30, 99, 0.15)',
    backgroundDarkHover: 'rgba(233, 30, 99, 0.22)',
    shadow: 'rgba(233, 30, 99, 0.2)',
  },
};

const colors = computed(() => colorMap[props.color]);
</script>

<style lang="scss" scoped>
.color-card {
  text-wrap: auto;
  border-radius: 12px;
  padding: 10px 10px 2px 10px;
  margin-bottom: 12px;
  border-left: 4px solid v-bind('colors.base');
  background: v-bind('props.transparent ? "transparent" : colors.background');
  transition: all 0.2s ease;

  .q-dark & {
    background: v-bind('props.transparent ? "transparent" : colors.backgroundDark');
  }

  &:hover {
    background: v-bind('props.transparent ? "transparent" : colors.backgroundHover');
    transform: v-bind('props.transparent ? "none" : "translateY(-2px)"');
    box-shadow: v-bind('props.transparent ? "none" : `0 4px 8px ${colors.shadow}`');

    .q-dark & {
      background: v-bind('props.transparent ? "transparent" : colors.backgroundDarkHover');
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
