<template lang="pug">
slot(v-if="isMounted")
template(v-else)
  slot(name="fallback")
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>
