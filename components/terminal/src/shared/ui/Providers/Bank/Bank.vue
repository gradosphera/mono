<script lang="ts" setup>
import type { IPaymentOrder } from 'src/shared/lib/types/payments';
import { onMounted, ref } from 'vue'
import QRCode from 'qrcode'

const props = defineProps<{
  paymentOrder: IPaymentOrder
}>()

const emit = defineEmits(['paymentSuccess', 'paymentFail'])

onMounted(() => {

  const qrElement = document.getElementById('qr') as HTMLCanvasElement | null;
  if (qrElement) {
    QRCode.toCanvas(qrElement, props.paymentOrder.details.data, { width: 200 }, function (error) {
      if (error) console.error(error)
      console.log('QR code rendered successfully!');
    });
  } else {
    console.error('QR element not found');
  }
})
</script>

<template lang="pug">
div
  p here
  p {{paymentOrder}}
  div.full-width.text-center
    canvas#qr
</template>
