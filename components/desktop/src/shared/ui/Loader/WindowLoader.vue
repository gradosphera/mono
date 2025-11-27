<template lang="pug">
.absolute-full.flex.flex-center.z-plus
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
<style>
.z-plus {
  z-index: 100;
}
</style>
