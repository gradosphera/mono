<script lang="ts" setup>
import type { IPaymentOrder } from 'src/shared/lib/types/payments';
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import QRCode from 'qrcode';
import { useCooperativeStore } from 'src/entities/Cooperative';

// Определяем интерфейс для orderData
interface IOrderData {
  sum?: string;
  name?: string;
  bankname?: string;
  bic?: string;
  kpp?: string;
  correspacc?: string;
  personalacc?: string;
  purpose?: string;
}

const props = defineProps<{
  paymentOrder: IPaymentOrder;
}>();

const qrElement = ref<HTMLCanvasElement | null>(null);
const coop = useCooperativeStore()

const amount = computed(() => {
  return orderData.value.sum ? `${(parseFloat(orderData.value.sum) / 100).toFixed(2)} ${coop.governSymbol}` : `0 ${coop.governSymbol}`;
});

const orderData = computed(() => {
  const dataString = props.paymentOrder.details.data;
  const parsedDetails: IOrderData = {};  // Используем тип IOrderData

  // Разбираем строку на пары ключ=значение
  const parts = dataString.split('|');

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key) {
      parsedDetails[key.toLowerCase() as keyof IOrderData] = value; // Ключи в нижнем регистре
    }
  }

  return parsedDetails;
})

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
    QRCode.toCanvas(qrElement.value, props.paymentOrder.details.data, {width: 400}, function (error) {
      if (error) console.error(error);
    });
  } else {
    console.error('QR element not found');
  }
};

const downloadQR = () => {
  if (qrElement.value) {
    const link = document.createElement('a');
    link.href = qrElement.value.toDataURL('image/png');
    link.download = 'qrcode.png';
    link.click();
  } else {
    console.error('QR element not found');
  }
};
</script>

<template lang="pug">
div
  q-input(label="Получатель" v-model="orderData.name" readonly)
  q-input(label="Банк получателя" v-model="orderData.bankname" readonly)
  q-input(label="БИК" v-model="orderData.bic" readonly)
  q-input(label="КПП" v-model="orderData.kpp" readonly)
  q-input(label="Корреспондентский счёт" v-model="orderData.correspacc" readonly)
  q-input(label="Номер счёта" v-model="orderData.personalacc" readonly)
  q-input(label="Cумма платежа" v-model="amount" readonly)
  q-input(label="Назначение платежа" v-model="orderData.purpose" readonly)

  div.full-width.text-center
    canvas#qr
  div.full-width.text-center
    q-btn(@click="downloadQR" flat icon="download") скачать QR
</template>

<style>
#qr{
  width: 200px !important;
  height: 200px !important;
}
</style>
