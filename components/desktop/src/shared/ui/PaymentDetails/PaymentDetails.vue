<template lang="pug">
.payment-details
  //- Причина ошибки для неуспешных платежей
  .payment-error.text-red-6.q-mb-sm(v-if='payment.status === "FAILED"')
    q-icon.q-mr-xs(name='error', size='sm')
    span {{ payment.message || 'нет дополнительной информации' }}

  //- Реквизиты исходящего платежа — компактные строки с копированием (DataRow)
  template(v-else-if='payment.direction === "OUTGOING" && payment.payment_details')
    DataRow(v-if='bankData?.bank_name', label='Банк получателя', :value='bankData.bank_name', copyable)
    DataRow(v-if='bankData?.details?.bik', label='БИК', :value='bankData.details.bik', copyable, mono)
    DataRow(v-if='bankData?.account_number', label='Номер счета', :value='bankData.account_number', copyable, mono)
    DataRow(v-if='bankData?.details?.corr', label='Корреспондентский счет', :value='bankData.details.corr', copyable, mono)
    DataRow(v-if='bankData?.card_number', label='Номер карты', :value='bankData.card_number', copyable, mono)
    DataRow(v-if='bankData?.currency', label='Валюта', :value='bankData.currency')
    DataRow(v-if='sbpData?.phone', label='Телефон (СБП)', :value='sbpData.phone', copyable, mono)
    //- Оплата расхода: получатель-организация и её реквизиты приходят
    //- свободной строкой из снимка СЗ (не платёжным методом пайщика).
    DataRow(v-if='freeData?.recipient_name', label='Получатель', :value='freeData.recipient_name', copyable)
    DataRow(v-if='freeData?.requisites', label='Реквизиты получателя', :value='freeData.requisites', copyable, mono)
    DataRow(v-if='expenseDescription', label='Что оплачиваем', :value='expenseDescription')
    DataRow(v-if='payment.memo', label='Назначение платежа', :value='payment.memo', copyable)
    DataRow(
      v-if='payment.payment_details.amount_without_fee',
      label='Сумма к переводу',
      :value='payment.payment_details.amount_without_fee + (bankData?.currency ? " " + bankData.currency : "")',
      copyable,
      mono
    )
    DataRow(
      v-if='payment.payment_details.fee_amount && payment.payment_details.fee_amount !== "0"',
      label='Комиссия',
      :value='payment.payment_details.fee_amount',
      mono
    )

  //- Blockchain-данные, если нет реквизитов
  div(v-else-if='payment.blockchain_data')
    .text-weight-medium.q-mb-sm Дополнительная информация:
    q-card.q-pa-md.bg-grey-1(flat)
      .text-caption.text-grey-7.q-mb-xs Данные блокчейна
      pre.text-body2.q-mb-none.font-mono {{ formatBlockchainData(payment.blockchain_data) }}

  //- Назначение платежа без банковских реквизитов (напр. возврат взноса кассиром):
  //- даём кассиру скопировать готовый текст назначения в платёжку.
  template(v-else-if='payment.memo')
    DataRow(label='Назначение платежа', :value='payment.memo', copyable)

  //- Сообщение по умолчанию
  div(v-else)
    .text-grey-6.text-center.q-py-md
      q-icon.q-mr-xs(name='info_outline', size='sm')
      span нет дополнительной информации
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DataRow } from 'src/shared/ui/domain/DataRow';
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
  pre {
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
    font-family: var(--p-mono);
  }

  .payment-error {
    text-wrap: auto;
  }
}
</style>
