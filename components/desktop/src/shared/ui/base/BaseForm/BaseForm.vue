<template>
  <form class="form" @submit.prevent="onSubmit">
    <div v-if="error" class="banner banner--neg" role="alert">
      <div class="banner__body">{{ error }}</div>
    </div>
    <div class="form__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="form-foot">
      <slot name="footer" :loading="loading" />
    </div>
  </form>
</template>

<script setup lang="ts">
import type { BaseFormProps } from './BaseForm.types';

const props = withDefaults(defineProps<BaseFormProps>(), {
  loading: false,
});

const emit = defineEmits<{
  submit: [event: Event];
}>();

function onSubmit(e: Event): void {
  if (props.loading) return;
  emit('submit', e);
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
