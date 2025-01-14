<template lang="pug">
q-card(flat ).no-select
  img(:src="src").img
  div.q-pa-md
    div.text-h6.q-mb-md {{ request.data.title }}
    div
      span Осталось:
        q-badge(size="lg").q-ml-xs {{ request.remain_units }} единиц
    div
      span Цена: 
        q-badge(size="lg").q-ml-xs {{ request.unit_cost }}
  
    
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { constructImageSrc } from 'src/shared/api'

  const props = defineProps({
    request: {
      type: Object,
      required: true,
    },
  })

  const src = computed(() => {
    const preview = props.request?.data?.preview
    return constructImageSrc(preview)
  })
</script>

<style>
  .img {
    max-height: 250px;
  }
</style>
