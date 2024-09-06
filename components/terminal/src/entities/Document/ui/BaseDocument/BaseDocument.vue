<template lang="pug">

q-card(style="word-break: break-all !important; white-space: normal !important;").q-pa-md
  div(v-if="loading").full-width.text-center
    div(style="margin:auto;").flex.q-pa-sm.full-width.text-center
      q-spinner
      span.q-ml-sm.text-grey подговка {{doc.meta.title}}
  div(v-if="!loading")

    div(v-html="doc.html").description.q-pa-xs

    div.row.q-mt-lg.q-pa-sm.justify-center
      q-card(style="word-break: break-all; text-wrap: pretty;" flat bordered).col-md-8.col-xs-12.q-pa-sm

        div.q-mr-lg.q-mt-md
          q-badge(:color="doc.hash == regeneratedHash ? 'green' : 'red'").text-center.q-pa-sm
            q-icon(:name="doc.hash == regeneratedHash ? 'check_circle' : 'cancel'" ).q-mr-sm
            span(style="font-size: 14px;") контрольная сумма
          p(style="font-size: 12px;").q-mr-lg.q-ml-lg.text-grey {{ doc.hash }}

        div.q-mr-lg.q-mt-md
          q-badge(:color="signature_verified ? 'green' : 'red'").text-center.q-pa-sm
            q-icon(:name="signature_verified ? 'check_circle' : 'cancel'" ).q-mr-sm
            span(style="font-size: 14px;") цифровая подпись
          p(style="font-size: 12px;").q-mr-lg.q-ml-lg.text-grey {{ actionDocumentData?.document?.signature }}

        div.q-mr-lg.q-mt-md
          q-badge(:color="signature_verified ? 'green' : 'red'").text-center.q-pa-sm
            q-icon(:name="signature_verified ? 'check_circle' : 'cancel'" ).q-mr-sm
            span(style="font-size: 14px;") публичный ключ
          p(style="font-size: 12px;").q-mr-lg.q-ml-lg.text-grey {{ actionDocumentData?.document?.public_key }}

        div.q-pa-md.text-center
          q-btn(icon="download" @click="download") скачать

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Cooperative, SovietContract } from 'cooptypes'
import { Signature, PublicKey } from '@wharfkit/antelope';
import { useGlobalStore } from 'src/shared/store';

const props = defineProps({
  action: {
    type: Object as () => Cooperative.Blockchain.IExtendedAction,
    required: true,
  },
  doc: {
    type: Object as () => Cooperative.Document.IGeneratedDocument,
    required: true
  }
})

const actionDocumentData = ref(props.action.data as SovietContract.Actions.Registry.NewSubmitted.INewSubmitted)
const doc = ref(props.doc)
const loading = ref(false)
const signature_verified = ref(false)

const regeneratedHash = ref()


const hashBuffer = async () => {
  // Декодирование из base64
  const binaryString = window.atob(doc.value.binary.toString());

  const len = binaryString.length;

  const data = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    data[i] = binaryString.charCodeAt(i);
  }

  // Вычисление хэша из декодированных бинарных данных
  regeneratedHash.value = (await useGlobalStore().hashMessage(data)).toUpperCase();
}

hashBuffer()


const verifySignature = () => {
  const public_key = PublicKey.from(actionDocumentData.value.document.public_key)
  const signature = Signature.from(actionDocumentData.value.document.signature)
  const hash = actionDocumentData.value.document.hash
  signature_verified.value = signature.verifyDigest(hash, public_key)
}

verifySignature()


async function download() {
  // Преобразование base64 строки в Blob
  const response = await fetch(`data:application/pdf;base64,${doc.value.binary.toString()}`);
  const blob = await response.blob();

  // Создание временной ссылки для скачивания файла
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = doc.value.full_title ? doc.value.full_title : `${doc.value.meta.title} - ${doc.value.meta.username} - ${doc.value.meta.created_at}.pdf`;

  // Имитация клика по ссылке для начала скачивания
  document.body.appendChild(link);
  link.click();

  // Очистка после скачивания
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

</script>
<style>
.description table {
  width: 100%;
  /* или другая фиксированная ширина */
  table-layout: fixed;
}

.description td {
  word-break: break-all !important;
  word-wrap: break-word !important;
  white-space: normal !important;
}
</style>
