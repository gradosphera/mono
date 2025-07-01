<template lang="pug">
div(ref='shadowHost')
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

console.log('ShadowHtml: component script setup starts');

const props = defineProps({
  html: { type: String, required: true },
  styles: { type: String, required: false, default: '' },
});

console.log('ShadowHtml initial props:', {
  html_length: props.html.length,
  styles_length: props.styles.length,
});

const shadowHost = ref<HTMLDivElement | null>(null);
let shadowRoot: ShadowRoot | null = null;
function renderToShadow() {
  if (shadowRoot) {
    console.log('ShadowHtml: rendering content to shadow root');
    shadowRoot.innerHTML =
      (props.styles ? `<style>${props.styles}</style>` : '') + props.html;
  } else {
    console.warn(
      'ShadowHtml: renderToShadow() called, but shadowRoot is not initialized yet.',
    );
  }
}
onMounted(() => {
  console.log('ShadowHtml: onMounted hook triggered.');
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

console.log('ShadowHtml: component script setup ends');
</script>
