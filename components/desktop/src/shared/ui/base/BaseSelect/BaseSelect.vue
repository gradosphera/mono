<template>
  <q-select
    outlined
    reserve-hint-space
    map-options
    emit-value
    no-error-icon
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    option-disable="disabled"
    :label="label"
    :hint="hint"
    :placeholder="placeholder"
    :error="!!error"
    :error-message="error"
    :disable="disabled"
    :name="name"
    :for="resolvedId"
    class="base-select"
    @update:model-value="onUpdate"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import type { BaseSelectProps } from './BaseSelect.types';

const props = withDefaults(defineProps<BaseSelectProps>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
}>();

const autoId = useId();
const resolvedId = computed(() => props.id ?? `base-select-${autoId}`);

function onUpdate(value: unknown): void {
  emit('update:modelValue', value as string | number | null);
}
</script>
