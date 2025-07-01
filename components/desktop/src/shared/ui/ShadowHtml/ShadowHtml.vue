<template lang="pug">
div(ref='shadowHost', v-if='isClient')

</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
const isClient = computed(
  () => typeof process !== 'undefined' && process.env && process.env.CLIENT,
);
const props = defineProps({
  html: { type: String, required: true },
  styles: { type: String, required: false, default: '' },
});
const shadowHost = ref<HTMLDivElement | null>(null);
let shadowRoot: ShadowRoot | null = null;
function renderToShadow() {
  if (shadowRoot) {
    shadowRoot.innerHTML =
      (props.styles ? `<style>${props.styles}</style>` : '') + props.html;
  }
}
onMounted(() => {
  if (isClient.value && shadowHost.value) {
    shadowRoot = shadowHost.value.attachShadow({ mode: 'open' });
    renderToShadow();
  }
});
watch(
  () => [props.html, props.styles],
  () => {
    if (isClient.value) renderToShadow();
  },
);
</script>
