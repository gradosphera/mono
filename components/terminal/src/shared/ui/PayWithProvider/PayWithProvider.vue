<script setup lang="ts">
import type { IPaymentOrder } from 'src/shared/lib/types/payments';
import { BankProvider } from '../Providers/Bank';
import { Yookassa } from '../Providers/Yookassa';
import { onMounted } from 'vue';

const props = defineProps<{
  paymentOrder: IPaymentOrder
}>()

const emit = defineEmits(['paymentSuccess', 'paymentFail'])

</script>

<template lang="pug">
div(v-if="paymentOrder.details?.data")
  BankProvider(v-if="paymentOrder.provider=='sberbank'" :payment-order="paymentOrder" @payment-fail="emit('paymentFail')" @payment-success="emit('paymentSuccess')")
  Yookassa(v-if="paymentOrder.provider=='yookassa'" :payment-order="paymentOrder" @payment-fail="emit('paymentFail')" @payment-success="emit('paymentSuccess')")

</template>
