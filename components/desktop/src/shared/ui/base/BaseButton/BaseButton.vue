<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-busy="loading || undefined"
  >
    <slot name="icon-left" />
    <span v-if="!iconOnly" class="btn__label"><slot /></span>
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseButtonProps } from './BaseButton.types';

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
});

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  props.size !== 'md' && `btn--${props.size}`,
  props.block && 'btn--block',
  props.iconOnly && 'btn--icon',
].filter(Boolean));
</script>
