<template>
  <div class="field">
    <label v-if="label" :for="resolvedId" class="field__label">{{ label }}</label>
    <div class="select-affix" :class="{ 'is-invalid': error }">
      <select
        :id="resolvedId"
        :value="modelValue ?? ''"
        :disabled="disabled"
        :required="required"
        :name="name"
        class="select"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled :selected="modelValue === null || modelValue === undefined">
          {{ placeholder }}
        </option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
          {{ opt.label }}
        </option>
      </select>
      <span class="select-affix__chev" aria-hidden="true">▾</span>
    </div>
    <div v-if="error" class="field__error">{{ error }}</div>
    <div v-else-if="hint" class="field__hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import type { BaseSelectProps } from './BaseSelect.types';

const props = withDefaults(defineProps<BaseSelectProps>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const autoId = useId();
const resolvedId = computed(() => props.id ?? `base-select-${autoId}`);

function onChange(e: Event): void {
  const v = (e.target as HTMLSelectElement).value;
  const opt = props.options.find((o) => String(o.value) === v);
  emit('update:modelValue', opt ? opt.value : v);
}
</script>

<style scoped>
.select-affix {
  position: relative;
  display: flex;
  align-items: center;
  height: 38px;
  background: var(--p-surface);
  border: 1px solid var(--p-line-1);
  border-radius: var(--p-r-sm);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}
.select-affix:focus-within {
  border-color: var(--p-accent);
  box-shadow: var(--p-focus-ring);
}
.select {
  flex: 1;
  height: 100%;
  padding: 0 14px;
  border: 0;
  outline: 0;
  background: transparent;
  appearance: none;
  font: inherit;
  color: var(--p-ink);
  cursor: pointer;
}
.select:disabled {
  color: var(--p-ink-3);
  cursor: not-allowed;
}
.select-affix__chev {
  padding: 0 14px;
  font-size: 12px;
  color: var(--p-ink-3);
  pointer-events: none;
}
.is-invalid {
  border-color: var(--p-neg) !important;
}
.field__error {
  margin-top: 6px;
  font-size: var(--p-fs-meta);
  color: var(--p-neg);
}
.field__hint {
  margin-top: 6px;
  font-size: var(--p-fs-meta);
  color: var(--p-ink-3);
}
</style>
