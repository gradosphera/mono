<template lang="pug">
.bg-none.full-width.text-center.q-pt-lg.q-pb-lg
  q-spinner.bg-none(size='50px', color='grey', style='margin: auto')
  p.full-width.text-center.text-grey(style='font-size: 12px') {{ text }}
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: '',
  },
});
const text = computed(() => props.text);
</script>
