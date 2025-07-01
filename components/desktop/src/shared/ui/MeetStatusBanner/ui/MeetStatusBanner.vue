<template lang="pug">
// Карточка статуса собрания в стиле минимального остатка
q-card.meet-status-card.q-pa-md(
  flat,
  v-if='extendedStatus && extendedStatus !== "NONE"'
)
  .minimum-balance-info
    .info-icon
      q-icon(:name='bannerConfig.icon', :color='iconColor', size='16px')
    .info-content
      .info-label {{ statusText }}
      .info-value(v-if='timeText') {{ timeText }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IMeet } from 'src/entities/Meet';
import {
  EXTENDED_STATUS_MAP,
  STATUS_BANNER_CONFIG,
} from 'src/shared/lib/consts';
import { formatDateFromNow } from 'src/shared/lib/utils/dates/timezone';

const props = defineProps<{
  meet: IMeet;
}>();

// Получаем расширенный статус собрания
const extendedStatus = computed(() => {
  return props.meet?.processing?.extendedStatus || 'NONE';
});

// Текст статуса собрания
const statusText = computed(() => {
  if (!props.meet?.processing?.extendedStatus) return 'Неизвестный статус';
  return (
    EXTENDED_STATUS_MAP[props.meet.processing.extendedStatus] ||
    'Неизвестный статус'
  );
});

// Конфигурация баннера
const bannerConfig = computed(() => {
  if (!props.meet?.processing?.extendedStatus) {
    return STATUS_BANNER_CONFIG['NONE'];
  }
  return (
    STATUS_BANNER_CONFIG[props.meet.processing.extendedStatus] ||
    STATUS_BANNER_CONFIG['NONE']
  );
});

const iconColor = computed(() => {
  const config = bannerConfig.value;
  return config.outline ? config.color : 'orange';
});

// Форматированное время до открытия/закрытия с учетом часового пояса
const timeText = computed(() => {
  if (!bannerConfig.value.needTime) return '';

  // Для статуса WAITING_FOR_OPENING
  if (props.meet?.processing?.extendedStatus === 'WAITING_FOR_OPENING') {
    if (!props.meet?.processing?.meet?.open_at) return '';
    return formatDateFromNow(props.meet.processing.meet.open_at);
  }

  // Для статуса VOTING_IN_PROGRESS
  if (props.meet?.processing?.extendedStatus === 'VOTING_IN_PROGRESS') {
    if (!props.meet?.processing?.meet?.close_at) return '';
    return formatDateFromNow(props.meet.processing.meet.close_at);
  }

  return '';
});
</script>

<style lang="scss" scoped>
// Минимальный остаток - точно как в WalletPage
.meet-status-card {
  background: rgba(255, 152, 0, 0.05);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;

  .q-dark & {
    background: rgba(255, 152, 0, 0.08);
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  &:hover {
    background: rgba(255, 152, 0, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 152, 0, 0.15);

    .q-dark & {
      background: rgba(255, 152, 0, 0.12);
    }
  }

  .minimum-balance-info {
    display: flex;
    align-items: center;

    .info-icon {
      margin-right: 12px;
    }

    .info-content {
      .info-label {
        font-size: 14px;
        margin-bottom: 2px;
        opacity: 0.7;
      }

      .info-value {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style>
