<template lang="pug">
q-checkbox.base-checkbox(
  :model-value='modelValue ?? false',
  :label='$slots.default ? undefined : label',
  :disable='disabled',
  :name='name',
  :for='resolvedId',
  size='sm',
  color='primary',
  :class='{ "base-checkbox--block": block }',
  @update:model-value='onUpdate'
)
  template(v-if='$slots.default')
    span.base-checkbox__label
      slot
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import type { BaseCheckboxProps } from './BaseCheckbox.types';

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
  disabled: false,
  block: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const autoId = useId();
const resolvedId = computed(() => props.id ?? `base-checkbox-${autoId}`);

function onUpdate(value: boolean | null): void {
  emit('update:modelValue', Boolean(value));
}
</script>

<style scoped>
.base-checkbox {
  color: var(--p-ink);
  font-size: var(--p-fs-body, 14px);
  line-height: var(--p-lh-body, 1.55);
}

/* block-вариант: чекбокс прижат к верху, label занимает всю ширину и
   переносит длинный текст согласия многострочно. */
.base-checkbox--block {
  display: flex;
  width: 100%;
  align-items: flex-start;
}
.base-checkbox--block :deep(.q-checkbox__inner) {
  margin-top: 2px;
}
.base-checkbox--block :deep(.q-checkbox__label) {
  flex: 1;
  white-space: normal;
}

.base-checkbox__label {
  display: inline;
}
</style>
