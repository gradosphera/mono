<template lang="pug">
div(v-html='html').statement
</template>

<script setup lang="ts">
defineProps({
  html: {
    type: String,
    required: true
  }
})
</script>

<style>
.statement {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
