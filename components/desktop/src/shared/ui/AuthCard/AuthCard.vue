<template lang="pug">
div.auth-card-container(:style="{ maxWidth: maxWidth + 'px' }").q-pa-md
  q-card(flat).auth-card
    slot
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  maxWidth?: number
}>(), {
  maxWidth: 800
})
</script>

<style scoped>
.auth-card-container {
  margin: 0 auto;
  position: relative;
}

/* Основная карточка */
.auth-card {
  border-radius: 20px;
  padding: 3rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary) 0%, var(--q-secondary) 50%, var(--q-accent) 100%);
  background-size: 200% 100%;
  animation: shimmer 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .auth-card-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
