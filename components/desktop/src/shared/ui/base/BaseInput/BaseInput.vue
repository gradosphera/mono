<template>
  <div class="field">
    <label v-if="label" :for="resolvedId" class="field__label">{{ label }}</label>

    <div v-if="prefix || suffix" class="input-affix" :class="{ 'is-invalid': error }">
      <span v-if="prefix" class="input-affix__suffix">{{ prefix }}</span>
      <input
        :id="resolvedId"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :name="name"
        :class="{ 'input--mono': mono }"
        @input="onInput"
      />
      <span v-if="suffix" class="input-affix__suffix">{{ suffix }}</span>
    </div>

    <input
      v-else
      :id="resolvedId"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :name="name"
      :class="['input', { 'input--mono': mono, 'is-invalid': error }]"
      @input="onInput"
    />

    <div class="field__message" :class="{ 'field__message--error': !!error }">
      {{ error || hint || ' ' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import type { BaseInputProps } from './BaseInput.types';

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  mono: false,
  readonly: false,
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const autoId = useId();
const resolvedId = computed(() => props.id ?? `base-input-${autoId}`);

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>

<style scoped>
/* Резервируем место под error/hint всегда — иначе появление сообщения
   дёргает форму вверх-вниз (layout shift) при keystroke-валидации.
   Когда нет ни ошибки, ни хинта — рендерится NBSP, высота сохраняется. */
.field__message {
  margin-top: 6px;
  font-size: var(--p-fs-meta);
  color: var(--p-ink-3);
  line-height: 1.4;
  min-height: calc(var(--p-fs-meta) * 1.4);
}
.field__message--error {
  color: var(--p-neg);
}
.is-invalid {
  border-color: var(--p-neg) !important;
}
</style>
