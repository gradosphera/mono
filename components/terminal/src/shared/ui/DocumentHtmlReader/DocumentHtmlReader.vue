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
.digital-document {
  padding: 0px !important;
}

.statement {
  word-wrap: break-word;
  /* white-space: pre-wrap; */
}
.statement h1 {
  font-weight: 700 !important;
  line-height: 4.5rem !important;
  font-size: 3rem !important;
}

@media (max-width: 600px) {
  .statement h1 {
    font-size: 1.5rem !important;
    line-height: 2rem !important;
  }
}

.statement h3 {
  font-size: 2rem !important;
  font-weight: 400 !important;
  line-height: 2rem !important;
  letter-spacing: normal !important;
}

@media (max-width: 600px) {
  .statement h3 {
    font-size: 1rem !important;
    line-height: 1.5rem !important;
    /* Добавить или изменить другие стили по мере необходимости */
  }
}
</style>
