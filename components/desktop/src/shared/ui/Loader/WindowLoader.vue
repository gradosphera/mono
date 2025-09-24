<template lang="pug">
.absolute-full.flex.flex-center.z-top
  Loader(size='50px', color='grey', style='margin: auto', :text='text')
</template>

<script setup lang="ts">
import { Loader } from '.';

defineProps({
  text: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
