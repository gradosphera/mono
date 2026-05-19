<template>
  <div :class="['banner', variant !== 'neutral' && `banner--${variant}`]">
    <span v-if="$slots.icon" class="banner__icon"><slot name="icon" /></span>
    <div class="banner__body"><slot /></div>
    <div v-if="$slots.action" class="banner__action"><slot name="action" /></div>
  </div>
</template>

<script setup lang="ts">
import type { BaseBannerProps } from './BaseBanner.types';

withDefaults(defineProps<BaseBannerProps>(), {
  variant: 'neutral',
});
</script>

<style scoped>
.banner__action {
  margin-left: auto;
  display: flex;
  align-items: center;
}
</style>
