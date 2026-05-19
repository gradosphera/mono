<template>
  <span :class="['status', `status--${variant}`]">
    <span class="status__dot" />
    <slot v-if="!dot" />
  </span>
</template>

<script setup lang="ts">
import type { BaseBadgeProps } from './BaseBadge.types';

withDefaults(defineProps<BaseBadgeProps>(), {
  variant: 'neutral',
  dot: false,
});
</script>
