<script lang="ts" setup>
import type {
  IPaymentOrder,
  IInitialPaymentOrder,
} from 'src/shared/lib/types/payments';
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import QRCode from 'qrcode';
import { copyToClipboard } from 'quasar';
import { SuccessAlert } from 'src/shared/api';
import { BaseInput } from 'src/shared/ui/base/BaseInput';
import { BaseButton } from 'src/shared/ui/base/BaseButton';

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
const detailsOpen = ref<boolean>(false);

const amount = computed(() => {
  return orderData.value.sum
    ? `${(parseFloat(orderData.value.sum) / 100).toFixed(2)} ${
        props.paymentOrder.symbol
      }`
    : `0 ${props.paymentOrder.symbol}`;
});

const orderData = computed(() => {
  const dataString = (props.paymentOrder.payment_details?.data as string) || '';
  const parsedDetails: IOrderData = {};

  const parts = dataString.split('|');

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key) {
      parsedDetails[key.toLowerCase() as keyof IOrderData] = value;
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

const copy = (data: string | undefined) => {
  if (!data) return;
  copyToClipboard(data)
    .then(() => SuccessAlert('Скопировано в буфер обмена'))
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
.bank-pay
  //- Главный экран: QR + ключевая сводка + действия.
  //- Полные реквизиты — под спойлером ниже.
  .bank-pay__summary
    .bank-pay__summary-row
      span.bank-pay__summary-label Получатель
      span.bank-pay__summary-value {{ orderData.name }}
    .bank-pay__summary-row
      span.bank-pay__summary-label Сумма
      span.bank-pay__summary-value.bank-pay__summary-amount {{ amount }}
    .bank-pay__summary-row(v-if='orderData.purpose')
      span.bank-pay__summary-label Назначение
      span.bank-pay__summary-value {{ orderData.purpose }}

  .bank-pay__qr
    canvas#qr.bank-pay__qr-canvas

  .bank-pay__actions
    BaseButton(variant='primary', @click='downloadQR')
      q-icon.q-mr-xs(name='download', size='16px')
      | Скачать QR
    BaseButton(variant='secondary', @click='copyAll')
      q-icon.q-mr-xs(name='content_copy', size='16px')
      | Скопировать реквизиты

  q-expansion-item.bank-pay__details(
    v-model='detailsOpen',
    label='Реквизиты для ручного перевода',
    icon='receipt_long',
    expand-icon-class='bank-pay__chevron',
    dense
  )
    .bank-pay__details-list
      .bank-pay__field
        BaseInput(label='ИНН получателя', :model-value='orderData.payeeinn', readonly, mono)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.payeeinn)')

      .bank-pay__field
        BaseInput(label='Получатель', :model-value='orderData.name', readonly)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.name)')

      .bank-pay__field
        BaseInput(label='БИК', :model-value='orderData.bic', readonly, mono)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.bic)')

      .bank-pay__field
        BaseInput(label='Банк получателя', :model-value='orderData.bankname', readonly)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.bankname)')

      .bank-pay__field
        BaseInput(label='КПП', :model-value='orderData.kpp', readonly, mono)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.kpp)')

      .bank-pay__field
        BaseInput(label='Корреспондентский счёт', :model-value='orderData.correspacc', readonly, mono)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.correspacc)')

      .bank-pay__field
        BaseInput(label='Номер счёта', :model-value='orderData.personalacc', readonly, mono)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.personalacc)')

      .bank-pay__field
        BaseInput(label='Сумма платежа', :model-value='amount', readonly, mono)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(amount)')

      .bank-pay__field
        BaseInput(label='Назначение платежа', :model-value='orderData.purpose', readonly)
          template(#append)
            q-btn(flat, dense, round, icon='content_copy', size='sm', @click='copy(orderData.purpose)')
</template>

<style scoped>
.bank-pay {
  display: flex;
  flex-direction: column;
  gap: var(--p-4, 16px);
}

/* Сводка ключевых полей сверху — то, по чему пользователь визуально
   верифицирует платёж перед сканированием QR. */
.bank-pay__summary {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
  padding: var(--p-4, 16px);
  background: var(--p-canvas-2, var(--p-canvas));
  border: 1px solid var(--p-line);
  border-radius: var(--p-radius-md, 8px);
}
.bank-pay__summary-row {
  display: flex;
  gap: var(--p-3, 12px);
  align-items: baseline;
  font-size: var(--p-fs-body-sm, 13px);
}
.bank-pay__summary-label {
  color: var(--p-ink-2);
  flex: 0 0 110px;
}
.bank-pay__summary-value {
  color: var(--p-ink);
  font-weight: 500;
  word-break: break-word;
}
.bank-pay__summary-amount {
  font-size: var(--p-fs-body, 14px);
  font-weight: 600;
  color: var(--p-ink);
}

/* QR-блок: центрированный canvas в нейтральной surface-2 рамке. */
.bank-pay__qr {
  display: flex;
  justify-content: center;
  padding: var(--p-4, 16px);
  background: #ffffff;
  border: 1px solid var(--p-line);
  border-radius: var(--p-radius-md, 8px);
}
.bank-pay__qr-canvas {
  width: 220px !important;
  height: 220px !important;
}

.bank-pay__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--p-3, 12px);
}

/* Свёрнутый блок полных реквизитов под expansion-item. */
.bank-pay__details {
  border: 1px solid var(--p-line);
  border-radius: var(--p-radius-md, 8px);
  background: var(--p-surface, var(--p-canvas-2));
}
.bank-pay__details :deep(.q-item) {
  border-radius: var(--p-radius-md, 8px);
}
.bank-pay__details-list {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
  padding: var(--p-3, 12px) var(--p-4, 16px) var(--p-4, 16px);
}
.bank-pay__field {
  width: 100%;
}
</style>
