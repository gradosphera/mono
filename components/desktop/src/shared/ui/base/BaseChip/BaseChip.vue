<template>
  <span :class="classes"><slot /></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseChipProps } from './BaseChip.types';

const props = withDefaults(defineProps<BaseChipProps>(), {
  variant: 'neutral',
  size: 'sm',
});

const classes = computed(() => [
  'chip',
  `chip--${props.variant}`,
  props.size === 'lg' && 'chip--lg',
].filter(Boolean));
</script>
