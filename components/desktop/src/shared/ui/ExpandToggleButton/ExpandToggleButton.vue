<template lang="pug">
q-btn(
  size='sm',
  flat,
  dense,
  round,
  :icon='icon',
  :disable='disable',
  @click.stop='$emit("click")'
)
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  expanded: boolean;
  variant?: 'list' | 'card';
  disable?: boolean;
}>();

defineEmits<{
  click: [];
}>();

const icon = computed(() => {
  if (props.variant === 'card') {
    return props.expanded ? 'expand_less' : 'expand_more';
  }
  return props.expanded ? 'expand_more' : 'chevron_right';
});
</script>