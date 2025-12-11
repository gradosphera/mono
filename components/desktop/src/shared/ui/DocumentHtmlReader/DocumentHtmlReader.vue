<template lang="pug">
div(v-html="renderedHtml").statement
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DOMPurify from 'dompurify';

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
  sanitize: {
    type: Boolean,
    default: true,
  },
});

const renderedHtml = computed(() => (props.sanitize ? DOMPurify.sanitize(props.html) : props.html));
</script>

<style>
.digital-document {
  padding: 0px !important;
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
