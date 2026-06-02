<script setup lang="ts">
import { BaseDialog, EmptyState } from 'src/shared/ui/base';

defineProps<{ modelValue: boolean }>();
defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();
</script>

<template>
  <BaseDialog
    :model-value="modelValue"
    title="Создание расхода"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <EmptyState
      title="В разработке"
      body="Форма-конструктор СЗ с массивом items ожидает закрытия C28-31. См. extensions/expenses/README.md (раздел «Когда расшивается C28-31»)."
    />
  </BaseDialog>
</template>
