<script lang="ts" setup>
import type {
  IPaymentOrder,
  IInitialPaymentOrder,
} from 'src/shared/lib/types/payments';
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import QRCode from 'qrcode';
import { copyToClipboard } from 'quasar';
import { SuccessAlert } from 'src/shared/api';

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
  payeeinn?: string;
}

const props = defineProps<{
  paymentOrder: IPaymentOrder | IInitialPaymentOrder;
}>();

const qrElement = ref<HTMLCanvasElement | null>(null);

const amount = computed(() => {
  return orderData.value.sum
    ? `${(parseFloat(orderData.value.sum) / 100).toFixed(2)} ${
        props.paymentOrder.symbol
      }`
    : `0 ${props.paymentOrder.symbol}`;
});

const orderData = computed(() => {
  const dataString = (props.paymentOrder.payment_details?.data as string) || '';
  const parsedDetails: IOrderData = {}; // Используем тип IOrderData

  // Разбираем строку на пары ключ=значение
  const parts = dataString.split('|');

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key) {
      parsedDetails[key.toLowerCase() as keyof IOrderData] = value; // Ключи в нижнем регистре
    }
  }

  return parsedDetails;
});

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
  if (qrElement.value && props.paymentOrder.payment_details?.data) {
    QRCode.toCanvas(
      qrElement.value,
      props.paymentOrder.payment_details.data,
      { width: 400 },
      function (error) {
        if (error) console.error(error);
      },
    );
  } else {
    console.error('QR element not found or payment data is missing');
  }
};

const copyAll = () => {
  const data = `
ИНН Получателя: ${orderData.value.payeeinn}
Получатель: ${orderData.value.name}
БИК: ${orderData.value.bic}
Банк получателя: ${orderData.value.bankname}
КПП: ${orderData.value.kpp}
Корреспондентский счёт: ${orderData.value.correspacc}
Номер счёта: ${orderData.value.personalacc}
Сумма платежа: ${amount.value}
Назначение платежа: ${orderData.value.purpose}
  `.trim();

  copy(data);
};

const copy = (data: any) => {
  copyToClipboard(data)
    .then(() => SuccessAlert('Реквизиты скопированы в буфер обмена'))
    .catch(console.log);
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
  q-input(label='ИНН получателя', v-model='orderData.payeeinn', readonly)
    template(v-slot:append)
      q-btn(
        icon='fas fa-copy',
        @click='copy(orderData.payeeinn)',
        size='xs',
        flat
      )

  q-input(label='Получатель', v-model='orderData.name', readonly)
    template(v-slot:append)
      q-btn(icon='fas fa-copy', @click='copy(orderData.name)', size='xs', flat)

  q-input(label='БИК', v-model='orderData.bic', readonly)
    template(v-slot:append)
      q-btn(icon='fas fa-copy', @click='copy(orderData.bic)', size='xs', flat)

  q-input(label='Банк получателя', v-model='orderData.bankname', readonly)
    template(v-slot:append)
      q-btn(
        icon='fas fa-copy',
        @click='copy(orderData.bankname)',
        size='xs',
        flat
      )

  q-input(label='КПП', v-model='orderData.kpp', readonly)
    template(v-slot:append)
      q-btn(icon='fas fa-copy', @click='copy(orderData.kpp)', size='xs', flat)

  q-input(
    label='Корреспондентский счёт',
    v-model='orderData.correspacc',
    readonly
  )
    template(v-slot:append)
      q-btn(
        icon='fas fa-copy',
        @click='copy(orderData.correspacc)',
        size='xs',
        flat
      )

  q-input(label='Номер счёта', v-model='orderData.personalacc', readonly)
    template(v-slot:append)
      q-btn(
        icon='fas fa-copy',
        @click='copy(orderData.personalacc)',
        size='xs',
        flat
      )

  q-input(label='Cумма платежа', v-model='amount', readonly)
    template(v-slot:append)
      q-btn(icon='fas fa-copy', @click='copy(amount)', size='xs', flat)

  q-input(label='Назначение платежа', v-model='orderData.purpose', readonly)
    template(v-slot:append)
      q-btn(
        icon='fas fa-copy',
        @click='copy(orderData.purpose)',
        size='xs',
        flat
      )

  .full-width.text-center.q-mt-md
    canvas#qr
  .full-width.text-center.q-gutter-sm
    q-btn(@click='copyAll', push size='sm' color="secondary")
      i.fa.fa-copy
      span.q-ml-sm скопировать реквизиты
    q-btn(@click='downloadQR', push size='sm' color="secondary")
      i.fa.fa-download
      span.q-ml-sm скачать QR
</template>

<style>
#qr {
  width: 200px !important;
  height: 200px !important;
}
</style>
