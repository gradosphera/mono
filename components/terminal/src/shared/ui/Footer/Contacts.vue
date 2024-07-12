<template lang='pug'>
div.q-pa-xs.text-center {{ text }}
</template>

<script setup lang='ts'>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: ''
  }
});
const text = computed(() => props.text)

</script>
