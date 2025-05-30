<template lang="pug">
q-avatar(color="primary" text-color="white" size="40px") {{ number }}
</template>

<script setup lang="ts">
defineProps({
  number: {
    type: [String, Number],
    required: true,
  },
})
</script>
