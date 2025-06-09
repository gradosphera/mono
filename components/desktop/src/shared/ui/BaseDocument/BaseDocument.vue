<template lang="pug">
q-card(:flat="isMobile" style="word-break: break-all !important; white-space: normal !important;").dynamic-padding

  div(v-if="loading").full-width.text-center
    div(style="margin:auto;").flex.q-pa-sm.full-width.text-center
      q-spinner
      span.q-ml-sm.text-grey подговка {{doc?.meta?.title}}
  div(v-if="!loading")
    div(v-html="safeHtml").description.q-pa-xs
    div.row.q-mt-lg.q-pa-sm.justify-center

      q-card(style="word-break: break-all !important; text-wrap: pretty;" flat).col-md-8.col-xs-12.q-pa-sm.verify-card
        div.q-mr-lg.q-mt-md
          q-badge(:color="documentAggregate?.document?.doc_hash == regeneratedHash ? 'teal' : 'red'").text-center.q-pa-xs
            q-icon(:name="documentAggregate?.document?.doc_hash == regeneratedHash ? 'check_circle' : 'cancel'" ).q-mr-sm
            span контрольная сумма
          p.q-mr-lg.q-ml-lg.text-grey {{ documentAggregate?.document?.doc_hash }}

        // Показываем все подписи (если это агрегат документа)
        template(v-if="documentAggregate?.document?.signatures && documentAggregate.document.signatures.length > 0")
          div.q-mr-lg.q-mt-md

            q-badge(:color="hasInvalidSignature ? 'red' : 'teal'").text-center.q-pa-xs
              q-icon(:name="hasInvalidSignature ? 'cancel' : 'verified'").q-mr-sm
              span Подписи ({{ documentAggregate.document.signatures.length }})

          // Список всех подписей
          q-list(bordered separator dense)
            q-expansion-item(
              v-for="(signature, index) in documentAggregate.document.signatures"
              :key="index"
              :label="`Подпись ${index + 1}: ${getSignerName(signature.signer_certificate)}`"
              header-class="signature-header"
              dense
            )
              q-card(flat)
                q-card-section
                  div.q-mb-sm
                    q-badge(:color="signature.is_valid ? 'teal' : 'red'").text-center.q-pa-xs
                      span Подписант
                    p.q-mt-sm.q-ml-lg {{ getSignerName(signature.signer_certificate) }}

                  div(v-if="signature.public_key").q-mb-sm
                    q-badge(:color="signature.is_valid ? 'teal' : 'red'").text-center.q-pa-xs
                      span Публичный ключ
                    p.q-mt-sm.q-ml-lg {{ signature.public_key }}

                  div(v-if="signature.signature").q-mb-sm
                    q-badge(:color="signature.is_valid ? 'teal' : 'red'").text-center.q-pa-xs
                      span Цифровая подпись
                    p.q-mt-sm.q-ml-lg {{ signature.signature }}

                  div.q-mt-md
                    q-badge(:color="signature.is_valid ? 'teal' : 'red'").text-center.q-pa-xs
                      q-icon(:name="signature.is_valid ? 'check_circle' : 'cancel'").q-mr-sm
                      span Статус подписи: {{ signature.is_valid ? 'Верифицирована' : 'Не верифицирована' }}

        div.text-center.q-gutter-sm.q-mt-md
          q-btn(size="sm" color="primary" icon="download" @click="download") скачать
          //- q-btn(size="sm" color="primary" icon="download" @click="download2") скачать2
          q-btn(size="sm" color="primary" icon="fa-solid fa-check-double" @click="regenerate" :loading="onRegenerate") сверить


</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGlobalStore } from 'src/shared/store';
import DOMPurify from 'dompurify';
import { DigitalDocument } from 'src/shared/lib/document';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useWindowSize } from 'src/shared/hooks';
import type { IDocumentAggregate } from 'src/entities/Document/model';
import { getNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';

const props = defineProps({
  documentAggregate: {
    type: Object as () => IDocumentAggregate,
    required: true
  }
})

const doc = computed(() => props.documentAggregate.rawDocument)

const loading = ref(false)
const { isMobile } = useWindowSize()
const regeneratedHash = ref()
const onRegenerate = ref(false)
const regenerated = ref()

const regenerate = async() => {
  try {
    onRegenerate.value = true

    regenerated.value = await new DigitalDocument().generate({...doc.value?.meta}, {skip_save: true})

    if (regenerated.value.hash == regeneratedHash.value)
      SuccessAlert('Сверка прошла успешно: аналогичный документ восстановлен из исходных данных')
    else
      FailAlert('Сверка прошла безуспешно: аналогичный документ невозможно получить из исходных данных')

    onRegenerate.value = false
  } catch(e){
    onRegenerate.value = false
  }
}

// Функция для декодирования и очистки HTML
function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['style'],
    ADD_ATTR: ['class', 'id']
  });
}

const safeHtml = computed(() => sanitizeHtml(doc.value?.html ?? ''));


const hashBuffer = async () => {
  try {
    // Декодирование из base64
    const binaryString = atob(doc.value?.binary ?? '');
    const len = binaryString.length;
    const data = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      data[i] = binaryString.charCodeAt(i);
    }

    // Вычисление хэша из декодированных бинарных данных
    regeneratedHash.value = (await useGlobalStore().hashMessage(data)).toUpperCase();
    console.log('Хэш успешно вычислен:', regeneratedHash.value);
  } catch (error) {
    console.error('Ошибка при вычислении хэша:', error);
  }
}

// Получение ФИО/названия подписанта по сертификату
const getSignerName = (signer_certificate: any) => {
  if (!signer_certificate) return 'Неизвестный подписант';
  return getNameFromCertificate(signer_certificate) || 'Неизвестный подписант';
}

// Верификация всех подписей из агрегата
const verifySignatures = () => {
  // if (props.documentAggregate?.document?.signatures?.length > 0) {
  //   signatures_verified.value = props.documentAggregate.document.signatures.map(signatureData => {
  //     try {
  //       if (signatureData.public_key && signatureData.signature) {
  //         const public_key = PublicKey.from(signatureData.public_key)
  //         const signature = Signature.from(signatureData.signature)
  //         const hash = doc.value?.hash
  //         const is_valid = signature.verifyDigest(hash, public_key)
  //         return is_valid
  //       } else {
  //         return signatureData.is_valid
  //       }
  //     } catch (error) {
  //       console.error('Ошибка при верификации подписи:', error)
  //       return false
  //     }
  //   })
  // }
}

onMounted(() => {
  hashBuffer()
  verifySignatures()
})

async function download() {
  try {
    // PDF теперь в формате base64, можно использовать data URL
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${doc.value?.binary}`;
    link.download = doc.value?.full_title ? doc.value?.full_title : `${doc.value?.meta?.title} - ${doc.value?.meta?.username} - ${doc.value?.meta?.created_at}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
  }
}

// Вычисляем, есть ли хотя бы одна невалидная подпись
const hasInvalidSignature = computed(() => props.documentAggregate?.document?.signatures?.some(signature => !signature.is_valid))

</script>
<style>

.description td {
  word-break: break-all !important;
  word-wrap: break-word !important;
  white-space: normal !important;
}

.digital-document .header {
  text-align: center;
  word-break: break-word !important;
}

.description {
  font-size: 14px;
  white-space: pre-wrap;
}

.description p {
  margin: 0 !important;
}

.verify-card {
  font-size: 10px !important;
}

.signature-header {
  font-size: 12px;
}

.signature-text {
  font-size: 10px;
  word-break: break-all;
}

@media (min-width: 700px) {
  .dynamic-padding {
    padding: 50px !important;
  }
}
@media (max-width: 700px) {
  .dynamic-padding {
    padding: 10px !important;
  }
}
/*
/* Стили для таблиц внутри документа */
.description table {
  width: 100%;
  border-collapse: collapse;
}

.description th,
.description td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.description th {
  background-color: #f4f4f4;
  width: 30% !important;
  max-width: 30% !important;
  word-break: break-word !important;
}
.q-table--no-wrap th, .q-table--no-wrap td {
  white-space: break-spaces !important;
  word-break: break-word !important;
}
</style>
