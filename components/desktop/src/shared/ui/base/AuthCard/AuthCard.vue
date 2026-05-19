<template>
  <div class="auth-card">
    <div class="auth-card__cap" aria-hidden="true" />
    <div class="auth-card__body">
      <div class="auth-card__head">
        <div class="auth-card__title">{{ title }}</div>
        <div v-if="subtitle" class="auth-card__sub">{{ subtitle }}</div>
      </div>
      <slot />
      <div v-if="$slots.footer" class="auth-card__foot">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthCardProps } from './AuthCard.types';

defineProps<AuthCardProps>();
</script>

<style scoped>
.auth-card {
  background: var(--p-surface);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-lg);
  overflow: hidden;
  box-shadow: var(--p-shadow-card);
  max-width: 420px;
  width: 100%;
}
.auth-card__cap {
  height: 4px;
  background: var(--p-accent);
}
.auth-card__body {
  padding: 28px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.auth-card__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.auth-card__title {
  font-size: var(--p-fs-h2);
  line-height: var(--p-lh-h2);
  font-weight: 600;
  letter-spacing: var(--p-ls-h2);
}
.auth-card__sub {
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm);
}
.auth-card__foot {
  padding-top: 12px;
  border-top: 1px solid var(--p-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
</style>
