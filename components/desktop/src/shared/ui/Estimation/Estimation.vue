<template lang="pug">
div
  // Микро-компонент для отображения оценки задачи
  .estimation-display(
    v-if='estimation != null && !Number.isNaN(estimation) && estimation > 0'
    :class='sizeClass'
  )
    q-icon(
      name='schedule',
      size='xs'
      color='grey-6'
    ).q-mr-xs
    span.estimation-text {{ formattedEstimation }}
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// Микро-компонент для отображения оценки задачи в часах/днях

const props = defineProps<{
  estimation?: number; // Оценка в часах
  size?: 'xs' | 'sm' | 'md';
}>();

// Форматирование оценки для отображения (допускаются дробные часы)
const formattedEstimation = computed(() => {
  const hours = props.estimation;
  if (hours == null || Number.isNaN(hours) || hours <= 0) return '';

  if (hours < 8) {
    const rounded = hours % 1 === 0 ? hours : parseFloat(hours.toFixed(2));
    return `${rounded}ч`;
  }
  const days = Math.round((hours / 8) * 10) / 10;
  return `${days}д`;
});

// Класс для размера
const sizeClass = computed(() => {
  return `estimation-${props.size || 'sm'}`;
});
</script>

<style lang="scss" scoped>
.estimation-display {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--q-grey-6);
  font-size: 12px;
  font-weight: 500;

  &.estimation-xs {
    font-size: 11px;
  }

  &.estimation-sm {
    font-size: 12px;
  }

  &.estimation-md {
    font-size: 13px;
  }

  .estimation-text {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
}
</style>
