<template lang="pug">
.payment-details
  .payment-details-content
  // Показываем причину ошибки для неуспешных платежей
  div(v-if='payment.status === "FAILED"')
    .payment-error.text-red-6.q-mb-sm
      q-icon.q-mr-xs(name='error', size='sm')
      span {{ payment.message || 'нет дополнительной информации' }}

  // Показываем реквизиты для исходящих платежей
  div(v-else-if='payment.direction === "OUTGOING" && payment.payment_details')
    q-card.q-pa-md(flat)
      .row.q-gutter-md
        .col-12.col-md-6(v-if='bankData?.bank_name')
          CopyableInput.full-width(
            :label='"Банк получателя"',
            :model-value='bankData.bank_name',
            dense
          )

        .col-12.col-md-6(v-if='bankData?.details?.bik')
          CopyableInput.full-width(
            :label='"БИК"',
            :model-value='bankData.details.bik',
            dense
          )

        .col-12.col-md-6(v-if='bankData?.account_number')
          CopyableInput.full-width(
            :label='"Номер счета"',
            :model-value='bankData.account_number',
            dense,
            input-class='font-mono'
          )

        .col-12.col-md-6(v-if='bankData?.details?.corr')
          CopyableInput.full-width(
            :label='"Корреспондентский счет"',
            :model-value='bankData.details.corr',
            dense,
            input-class='font-mono'
          )

        .col-12.col-md-6(v-if='bankData?.card_number')
          CopyableInput.full-width(
            :label='"Номер карты"',
            :model-value='bankData.card_number',
            dense,
            input-class='font-mono'
          )

        .col-12.col-md-6(v-if='bankData?.currency')
          CopyableInput.full-width(
            :label='"Валюта"',
            :model-value='bankData.currency',
            dense
          )

        .col-12.col-md-6(v-if='sbpData?.phone')
          CopyableInput.full-width(
            :label='"Телефон (СБП)"',
            :model-value='sbpData.phone',
            dense
          )

        //- Оплата расхода: получатель-организация и её реквизиты приходят
        //- свободной строкой из снимка СЗ (не платёжным методом пайщика).
        .col-12.col-md-6(v-if='freeData?.recipient_name')
          CopyableInput.full-width(
            :label='"Получатель"',
            :model-value='freeData.recipient_name',
            dense
          )

        .col-12(v-if='freeData?.requisites')
          CopyableInput.full-width(
            :label='"Реквизиты получателя"',
            :model-value='freeData.requisites',
            dense,
            input-class='font-mono'
          )

        .col-12(v-if='expenseDescription')
          CopyableInput.full-width(
            :label='"Что оплачиваем"',
            :model-value='expenseDescription',
            dense
          )

        .col-12.col-md-6(v-if='payment.memo')
          CopyableInput.full-width(
            :label='"Назначение платежа"',
            :model-value='payment.memo',
            dense
          )

        // Показываем информацию о сумме и комиссии
        .col-12.col-md-6(v-if='payment.payment_details.amount_without_fee')
          CopyableInput.full-width(
            :label='"Сумма к переводу"',
            :model-value='payment.payment_details.amount_without_fee + (bankData?.currency ? " " + bankData.currency : "")',
            dense,
            input-class='text-weight-medium'
          )

        .col-12.col-md-6(
          v-if='payment.payment_details.fee_amount && payment.payment_details.fee_amount !== "0"'
        )
          CopyableInput.full-width(
            :label='"Комиссия"',
            :model-value='payment.payment_details.fee_amount',
            dense
          )

  // Показываем blockchain данные если есть
  div(v-else-if='payment.blockchain_data')
    .text-weight-medium.q-mb-sm Дополнительная информация:
    q-card.q-pa-md.bg-grey-1(flat)
      .text-caption.text-grey-7.q-mb-xs Данные блокчейна
      pre.text-body2.q-mb-none.font-mono {{ formatBlockchainData(payment.blockchain_data) }}

  // Назначение платежа без банковских реквизитов (напр. возврат взноса кассиром):
  // даём кассиру скопировать готовый текст назначения в платёжку.
  div(v-else-if='payment.memo')
    q-card.q-pa-md(flat)
      CopyableInput.full-width(
        :label='"Назначение платежа"',
        :model-value='payment.memo',
        dense
      )

  // Показываем сообщение по умолчанию
  div(v-else)
    .text-grey-6.text-center.q-py-md
      q-icon.q-mr-xs(name='info_outline', size='sm')
      span нет дополнительной информации
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CopyableInput } from 'src/shared/ui';
import type { IPayment, IBankAccount, ISbpAccount } from 'src/entities/Payment';

interface Props {
  payment: IPayment;
}

const props = defineProps<Props>();
const payment = props.payment;

// Типизированные computed для различных типов данных платежных методов
const bankData = computed(() => {
  const data = payment.payment_details?.data;
  // Проверяем, является ли это банковским аккаунтом (есть поле bank_name)
  if (data && typeof data === 'object' && 'bank_name' in data) {
    return data as IBankAccount;
  }
  return null;
});

const sbpData = computed(() => {
  const data = payment.payment_details?.data;
  // Проверяем, является ли это СБП аккаунтом (есть поле phone)
  if (data && typeof data === 'object' && 'phone' in data) {
    return data as ISbpAccount;
  }
  return null;
});

// Свободные реквизиты (оплата расхода организации/ИП по снимку СЗ)
const freeData = computed(() => {
  const data = payment.payment_details?.data;
  if (data && typeof data === 'object' && ('requisites' in data || 'recipient_name' in data)) {
    return data as { recipient_name?: string; requisites?: string };
  }
  return null;
});

// Описание позиции расхода — кассиру важно видеть, что именно оплачивается
const expenseDescription = computed(() => {
  const data = payment.blockchain_data;
  if (data && typeof data === 'object' && 'description' in data) {
    return (data as { description?: string }).description || null;
  }
  return null;
});

/**
 * Форматирует данные блокчейна для отображения
 */
const formatBlockchainData = (data: any): string => {
  if (!data) return '';

  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};
</script>

<style lang="scss" scoped>
.payment-details {
  .font-mono {
    font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.9em;
  }

  pre {
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
  }

  // Ограничиваем ширину всего контента для лучшей читаемости
  .payment-error {
    text-wrap: auto;
  }
}
</style>
