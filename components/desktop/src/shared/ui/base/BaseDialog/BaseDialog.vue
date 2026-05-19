<template>
  <Teleport to="body">
    <Transition name="base-dialog">
      <div
        v-if="modelValue"
        class="base-dialog__overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'base-dialog-title' : undefined"
        @click.self="onBackdrop"
        @keydown.esc="onEscape"
      >
        <div class="dialog" :class="`base-dialog--${size}`" tabindex="-1">
          <div v-if="title || $slots.head || !hideCloseButton" class="dialog__head">
            <div id="base-dialog-title" class="dialog__title">
              <slot name="head">{{ title }}</slot>
            </div>
            <button
              v-if="!hideCloseButton"
              class="icon-btn"
              type="button"
              aria-label="Закрыть"
              @click="emit('update:modelValue', false)"
            >
              ×
            </button>
          </div>

          <div class="dialog__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="dialog__foot">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import type { BaseDialogProps } from './BaseDialog.types';

const props = withDefaults(defineProps<BaseDialogProps>(), {
  size: 'md',
  closeOnBackdrop: true,
  closeOnEscape: true,
  hideCloseButton: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function onBackdrop(): void {
  if (props.closeOnBackdrop) emit('update:modelValue', false);
}
function onEscape(): void {
  if (props.closeOnEscape) emit('update:modelValue', false);
}
function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.modelValue && props.closeOnEscape) {
    emit('update:modelValue', false);
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
  },
);
</script>

<style scoped>
.base-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--p-overlay);
  backdrop-filter: blur(6px);
}
.base-dialog--sm { max-width: 360px !important; }
.base-dialog--md { max-width: 440px !important; }
.base-dialog--lg { max-width: 640px !important; }

.base-dialog-enter-active,
.base-dialog-leave-active {
  transition: opacity var(--p-dur-base, 200ms) ease;
}
.base-dialog-enter-active .dialog,
.base-dialog-leave-active .dialog {
  transition: transform var(--p-dur-base, 200ms) ease;
}
.base-dialog-enter-from,
.base-dialog-leave-to {
  opacity: 0;
}
.base-dialog-enter-from .dialog,
.base-dialog-leave-to .dialog {
  transform: translateY(8px);
}
</style>
