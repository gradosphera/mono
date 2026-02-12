<template lang="pug">
div
  // Микро-компонент для отображения оценки задачи
  .estimation-display(
    v-if='estimation'
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

// Форматирование оценки для отображения
const formattedEstimation = computed(() => {
  if (!props.estimation) return '';

  const hours = props.estimation;
  if (hours < 8) {
    return `${hours}ч`;
  } else {
    const days = Math.round(hours / 8 * 10) / 10; // Округляем до 1 знака
    return `${days}д`;
  }
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
