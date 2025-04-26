<template lang="pug">
div.q-pa-xs.col-xs-12.col-sm-12.col-md-12.q-mt-md
  q-card(bordered flat)
    q-card-section.q-py-xs
      div.text-subtitle2 № {{ payment.id }}
      div.text-caption Сумма: {{ payment.amount }}

    q-separator

    q-card-section.q-py-xs
      div.row.items-center
        div.col-6 Тип платежа:
        div.col-6.text-right
          q-badge(v-if="payment.details.data.includes('registration')") регистрационный
          q-badge(v-else) паевой

      div.row.items-center.q-mt-sm
        div.col-6 От кого:
        div.col-6.text-right {{ payment.username }}

      div.row.items-center.q-mt-sm
        div.col-6 Статус:
        div.col-6.text-right
          q-badge(v-if="payment.status ==='COMPLETED'" color="teal") обработан
          q-badge(v-if="payment.status ==='PENDING'" color="orange") ожидание оплаты
          q-badge(v-if="payment.status ==='FAILED'" color="red") ошибка
          q-badge(v-if="payment.status ==='PAID'" color="orange") оплачен
          q-badge(v-if="payment.status ==='REFUNDED'" color="grey") отменён
          q-badge(v-if="payment.status ==='EXPIRED'" color="grey") истёк

    q-card-actions(align="right")
      q-btn(
        v-if="payment.message"
        size="sm"
        flat
        icon="expand_more"
        @click="$emit('toggle-expand')"
      )
        | {{ expanded ? 'Скрыть' : 'Подробнее' }}

      q-btn-dropdown(v-if="!hideActions" size="sm" label="действия" color="primary")
        q-list(dense)
          SetOrderPaidStatusButton(:id="payment.id" @close="$emit('close-dropdown')")
          SetOrderRefundedStatusButton(:id="payment.id" @close="$emit('close-dropdown')")

    q-slide-transition
      div(v-show="expanded && payment.message")
        q-separator
        q-card-section
          p Причина ошибки: {{payment.message}}
</template>

<script setup lang="ts">
import { SetOrderPaidStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderPaidStatusButton';
import { SetOrderRefundedStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderRefundedStatusButton';

defineProps({
  payment: {
    type: Object,
    required: true
  },
  expanded: {
    type: Boolean,
    default: false
  },
  hideActions: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-expand', 'close-dropdown'])
</script>
