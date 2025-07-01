<template lang="pug">
div(ref='shadowHost')
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

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
  } else {
    console.warn(
      'ShadowHtml: renderToShadow() called, but shadowRoot is not initialized yet.',
    );
  }
}
onMounted(() => {
  if (shadowHost.value) {
    if (!shadowRoot) {
      console.log('ShadowHtml: shadowHost found, attaching shadow DOM.');
      shadowRoot = shadowHost.value.attachShadow({ mode: 'open' });
      renderToShadow();
    }
  } else {
    console.error(
      'ShadowHtml: onMounted hook - shadowHost ref is not available.',
    );
  }
});
watch(
  () => [props.html, props.styles],
  () => {
    console.log('ShadowHtml: watcher triggered due to props change.');
    renderToShadow();
  },
);
</script>
