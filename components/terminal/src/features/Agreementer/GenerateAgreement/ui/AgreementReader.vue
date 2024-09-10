<template lang="pug">
  div(v-if="agreement")
    DocumentHtmlReader(:html="agreement.html")
  </template>

<script setup lang="ts">
  import { COOPNAME } from 'src/shared/config';
  import { useGenerateAgreement } from '../model';
  import { useSessionStore } from 'src/entities/Session';
  import { onMounted, ref } from 'vue';
  import { FailAlert } from 'src/shared/api';
  import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
  import type { IGeneratedDocument } from 'src/entities/Document';
  import { agreementType, useAgreementStore } from 'src/entities/Agreement';
  const session = useSessionStore();

  const agreementStore = useAgreementStore()

  const { generateAgreement } = useGenerateAgreement();

  const agreement = ref<IGeneratedDocument | null >(null)

  const props = defineProps({
    type: {
      type: String,
      required: true,
    },
  });

  onMounted(async () => {
    try {
      if (props.type === 'wallet') {
        agreement.value = await generateAgreement(COOPNAME, session.username, agreementType.wallet);
        agreementStore.generatedWalletAgreement = agreement.value
      } else {
        FailAlert('Неизвестный тип соглашения')
      }
    } catch(e){
      FailAlert('Возникла ошибка при генерации соглашения, пожалуйста, обратитесь в поддержку');
    }

  });
  </script>
