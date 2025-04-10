<template>
  <span>{{ props.accountName }}</span>
</template>

<script setup lang="ts">
  const props = defineProps<{
    accountName: string
  }>()
</script>

<style lang="scss" scoped></style>
