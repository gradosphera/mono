<template>
  <div :class="['card', variant !== 'default' && `card--${variant}`]">
    <div v-if="hasHead" class="card__head">
      <slot name="head">
        <div>
          <div v-if="title" class="card__title">{{ title }}</div>
          <div v-if="subtitle" class="card__sub">{{ subtitle }}</div>
        </div>
      </slot>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { BaseCardProps } from './BaseCard.types';

const props = withDefaults(defineProps<BaseCardProps>(), {
  variant: 'default',
});

const slots = useSlots();
const hasHead = computed(() => !!(props.title || props.subtitle || slots.head || slots.actions));
</script>
