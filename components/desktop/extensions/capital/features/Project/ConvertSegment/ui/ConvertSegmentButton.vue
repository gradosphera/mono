<template lang="pug">
q-btn(
  color='primary',
  @click='$emit("click", $event)',
  label='Получить сегмент'
)
</template>

<script setup lang="ts">
defineEmits<{
  click: [event: Event];
}>();
</script>
