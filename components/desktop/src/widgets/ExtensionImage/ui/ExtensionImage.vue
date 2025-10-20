<template lang="pug">
q-img(v-if='image', :src='image')
</template>

<script lang="ts" setup>
interface Props {
  image?: string | null;
}

defineProps<Props>();
</script>
