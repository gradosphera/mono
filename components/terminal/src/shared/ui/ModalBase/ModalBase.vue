<script setup lang="ts">
import { computed } from 'vue';

  interface IProps {
    title?: string
  }
  const props = defineProps<IProps>()
  const title = computed(() => props.title)
</script>

<template lang="pug">
q-card(style="min-width: 350px; max-width: 100%;")
  q-bar(style="background: 'primary'")
    span {{ title }}
    q-space
    q-btn(v-close-popup dense flat icon="close")
      q-tooltip Закрыть
  slot

</template>
