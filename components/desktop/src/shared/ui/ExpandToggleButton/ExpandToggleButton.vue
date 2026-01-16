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
  expanded: boolean | undefined;
  variant?: 'list' | 'card';
  disable?: boolean;
}>();

defineEmits<{
  click: [];
}>();

const icon = computed(() => {
  const isExpanded = props.expanded ?? false;
  if (props.variant === 'card') {
    return isExpanded ? 'expand_less' : 'expand_more';
  }
  return isExpanded ? 'expand_more' : 'chevron_right';
});
</script>
