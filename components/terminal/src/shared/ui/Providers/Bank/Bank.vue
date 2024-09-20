<script lang="ts" setup>
import type { IPaymentOrder } from 'src/shared/lib/types/payments';
import { onMounted } from 'vue'

const props = defineProps<{
  paymentOrder: IPaymentOrder
}>()

const emit = defineEmits(['paymentSuccess', 'paymentFail'])

</script>

<template lang="pug">
div
  p here
  p {{paymentOrder}}
</template>
