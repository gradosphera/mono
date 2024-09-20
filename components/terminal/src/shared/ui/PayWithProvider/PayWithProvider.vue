<script setup lang="ts">
import type { IPaymentOrder } from 'src/shared/lib/types/payments';
import { BankProvider } from '../Providers/Bank';
import { Yookassa } from '../Providers/Yookassa';
import { onMounted } from 'vue';
import { createInitialPaymentOrder } from 'src/shared/api/payments';

const props = defineProps<{
  provider: string
  paymentOrder: IPaymentOrder
}>()

const emit = defineEmits(['paymentSuccess', 'paymentFail'])

onMounted(() => {
  createInitialPaymentOrder(props.provider)
})

</script>

<template lang="pug">
div(v-if="paymentOrder.details?.data")
  BankProvider(v-if="provider=='sberbank'" :payment-order="paymentOrder" @payment-fail="emit('paymentFail')" @payment-success="emit('paymentSuccess')")
  Yookassa(v-if="provider=='yookassa'" :payment-order="paymentOrder" @payment-fail="emit('paymentFail')" @payment-success="emit('paymentSuccess')")

</template>
