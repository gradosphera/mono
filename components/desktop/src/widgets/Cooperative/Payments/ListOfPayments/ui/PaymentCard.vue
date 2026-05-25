<template lang="pug">
.payment-card__container
  q-card.payment-card(flat)
    q-card-section.payment-card__header-section(
      :class='{ "cursor-pointer": $q.screen.lt.md }',
      @click='$q.screen.lt.md ? $emit("toggle-expand") : undefined'
    )
      .payment-header
        .payment-icon
          q-icon(
            :name='getDirectionIcon(payment.direction)',
            size='24px',
            :color='getDirectionColor(payment.direction)'
          )
        .payment-title
          .title {{ payment.type_label }}
          .subtitle {{ getShortNameFromCertificate(payment.username_certificate) || payment.username }}
          .subtitle {{ formatDateToHumanDateTime(payment.created_at) }}
      .payment-amount
        .amount {{ payment.quantity }} {{ payment.symbol }}
        .status
          BaseBadge(:variant='getStatusVariant(payment.status)') {{ payment.status_label }}

    q-slide-transition
      div(v-show='expanded')
        q-separator

        // Блок с действиями в самом верху разворота
        q-card-section.actions-section(
          v-if='!hideActions && hasAvailableActions'
        )
          .row.justify-center.q-gutter-sm
            SetOrderPaidStatusButton(
              v-if='payment.id && ["PENDING", "FAILED", "EXPIRED"].includes(payment.status)',
              :id='String(payment.id)'
            )
            SetOrderRefundedStatusButton(
              v-if='payment.id && ["PENDING", "FAILED", "EXPIRED"].includes(payment.status)',
              :id='String(payment.id)'
            )

        q-card-section
          PaymentDetails(:payment='payment')

  // Только кнопка разворота снаружи
  .expand-button-external
    ExpandToggleButton(
      :expanded='expanded',
      variant='card',
      @click='$emit("toggle-expand")'
    )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { SetOrderPaidStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderPaidStatusButton';
import { SetOrderRefundedStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderRefundedStatusButton';
import { getShortNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { formatDateToHumanDateTime } from 'src/shared/lib/utils/dates/formatDateToHumanDateTime';
import { PaymentDetails } from 'src/shared/ui';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import type { BaseBadgeVariant } from 'src/shared/ui/base/BaseBadge';
import type { IPayment } from 'src/entities/Payment';
import { Zeus } from '@coopenomics/sdk';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';

const $q = useQuasar();

const props = defineProps<{
  payment: IPayment;
  expanded?: boolean;
  hideActions?: boolean;
}>();

defineEmits(['toggle-expand', 'close-dropdown']);

// Проверяем наличие доступных действий (аналогично логике в таблице)
const hasAvailableActions = computed(() => {
  return ['EXPIRED', 'PENDING', 'FAILED'].includes(props.payment.status || '');
});

const getDirectionIcon = (direction?: string | null) => {
  return direction === Zeus.PaymentDirection.INCOMING
    ? 'fa-solid fa-arrow-down'
    : 'fa-solid fa-arrow-up';
};

const getDirectionColor = (direction?: string | null) => {
  return direction === Zeus.PaymentDirection.INCOMING ? 'positive' : 'negative';
};

// Статус платежа → canon-вариант бейджа (точка + цвет из дизайн-токенов).
const statusVariants: Record<string, BaseBadgeVariant> = {
  [Zeus.PaymentStatus.COMPLETED]: 'pos',
  [Zeus.PaymentStatus.PENDING]: 'warn',
  [Zeus.PaymentStatus.FAILED]: 'neg',
  [Zeus.PaymentStatus.PAID]: 'info',
  [Zeus.PaymentStatus.REFUNDED]: 'neutral',
  [Zeus.PaymentStatus.EXPIRED]: 'neutral',
};

const getStatusVariant = (status?: string | null): BaseBadgeVariant => {
  if (!status) return 'neutral';
  return statusVariants[status] || 'neutral';
};
</script>

<style lang="scss" scoped>
.payment-card__container {
  padding: 8px;
  width: 100%;
}

.payment-card {
  border-radius: var(--p-r-lg, 16px);
  border: 1px solid var(--p-line);
  transition: box-shadow var(--p-dur-base, 0.2s) ease-in-out, transform var(--p-dur-base, 0.2s) ease-in-out;
  &:hover {
    box-shadow: var(--p-shadow-card);
    transform: translateY(-1px);
  }
}

.payment-card__header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.payment-title .title {
  font-size: 16px;
  font-weight: 500;
}

.payment-title .subtitle {
  font-size: 12px;
  color: var(--p-ink-3);
}

.payment-amount {
  text-align: right;
}

.payment-amount .amount {
  font-size: 18px;
  font-weight: 600;
}

.payment-amount .status {
  margin-top: 4px;
}

.expand-button-external {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
}

.actions-section {
  padding: 12px 16px !important;
  background-color: var(--p-surface-2);
}
</style>
