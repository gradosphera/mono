<script lang="ts" setup>
import type { IPaymentOrder } from 'src/shared/lib/types/payments';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import QRCode from 'qrcode';

const props = defineProps<{
  paymentOrder: IPaymentOrder;
}>();

const emit = defineEmits(['paymentSuccess', 'paymentFail']);

const qrElement = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  qrElement.value = document.getElementById('qr') as HTMLCanvasElement | null;
  generateQRCode();
});

onBeforeUnmount(() => {
  if (qrElement.value) {
    const ctx = qrElement.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, qrElement.value.width, qrElement.value.height);
    }
  }
});

const generateQRCode = () => {
  if (qrElement.value) {
    console.log('on generate: ', props.paymentOrder.details.data)
    QRCode.toCanvas(qrElement.value, props.paymentOrder.details.data, { width: 200 }, function (error) {
      if (error) console.error(error);
    });
  } else {
    console.error('QR element not found');
  }
};
</script>

<template lang="pug">
div
  p {{paymentOrder}}
  div.full-width.text-center
    canvas#qr
</template>
