<template>
  <div class="auth-card-shell" :style="{ maxWidth: `${maxWidth ?? 480}px` }">
    <div class="card auth-card">
      <header v-if="title || subtitle || $slots.head" class="card__head auth-card__head">
        <slot name="head">
          <div>
            <h1 v-if="title" class="card__title auth-card__title">{{ title }}</h1>
            <p v-if="subtitle" class="card__sub auth-card__sub">{{ subtitle }}</p>
          </div>
        </slot>
      </header>

      <div class="auth-card__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="auth-card__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthCardProps } from './AuthCard.types';

defineProps<AuthCardProps>();
</script>

<style scoped>
.auth-card-shell {
  width: 100%;
  margin: 0 auto;
}
.auth-card {
  padding: var(--p-6, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--p-5, 20px);
}
.auth-card__head {
  margin-bottom: 0;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  text-align: center;
}
.auth-card__title {
  font-size: var(--p-fs-h2);
  line-height: var(--p-lh-h2);
  letter-spacing: var(--p-ls-h2);
}
.auth-card__sub {
  margin-top: 6px;
}
.auth-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--p-4, 16px);
}
.auth-card__footer {
  border-top: 1px solid var(--p-line);
  padding-top: var(--p-4, 16px);
  display: flex;
  justify-content: center;
  gap: var(--p-3, 12px);
  font-size: var(--p-fs-body-sm);
}
</style>
