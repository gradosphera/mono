<template lang="pug">
div.q-pa-xs.col-xs-12.col-sm-12.col-md-12.q-mt-md
  q-card(bordered flat)
    q-card-section.q-py-xs
      div.text-subtitle2 № {{ order.order_num }}
      div.text-caption Сумма: {{ order.quantity }}

    q-separator

    q-card-section.q-py-xs
      div.row.items-center
        div.col-6 Тип платежа:
        div.col-6.text-right
          q-badge(v-if="order.type ==='registration'") регистрационный
          q-badge(v-if="order.type ==='deposit'") паевой

      div.row.items-center.q-mt-sm
        div.col-6 От кого:
        div.col-6.text-right {{ getNameFromUserData(order.user?.private_data) }}

      div.row.items-center.q-mt-sm
        div.col-6 Статус:
        div.col-6.text-right
          q-badge(v-if="order.status ==='completed'" color="teal") обработан
          q-badge(v-if="order.status ==='pending'" color="orange") ожидание оплаты
          q-badge(v-if="order.status ==='failed'" color="red") ошибка
          q-badge(v-if="order.status ==='paid'" color="orange") оплачен
          q-badge(v-if="order.status ==='refunded'" color="grey") отменён
          q-badge(v-if="order.status ==='expired'" color="grey") истёк

    q-card-actions(align="right")
      ExpandToggleButton(
        v-if="order.message"
        :expanded="expanded"
        variant="card"
        @click="$emit('toggle-expand')"
      )
        | {{ expanded ? 'Скрыть' : 'Подробнее' }}

      q-btn-dropdown(v-if="!hideActions" size="sm" label="действия" color="primary")
        q-list(dense)
          SetOrderPaidStatusButton(:id="order.id" @close="$emit('close-dropdown')")
          SetOrderRefundedStatusButton(:id="order.id" @close="$emit('close-dropdown')")

    q-slide-transition
      div(v-show="expanded && order.message")
        q-separator
        q-card-section
          p Причина ошибки: {{order.message}}
</template>

<script setup lang="ts">
import { getNameFromUserData } from 'src/shared/lib/utils/getNameFromUserData';
import { SetOrderPaidStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderPaidStatusButton';
import { SetOrderRefundedStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderRefundedStatusButton';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';

defineProps({
  order: {
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
