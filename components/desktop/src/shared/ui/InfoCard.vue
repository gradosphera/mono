<template lang="pug">
.q-mb-md.q-pa-sm.bg-blue-1.rounded-borders.q-info-block
  .text-body2.text-grey-8(:style='"max-width: 420px; margin: 0 auto;"')
    q-icon.q-mr-sm(name='info', color='primary')
    | {{ text }}
</template>

<script setup lang="ts">

defineProps<{ text: string }>();
</script>

<style scoped></style>
