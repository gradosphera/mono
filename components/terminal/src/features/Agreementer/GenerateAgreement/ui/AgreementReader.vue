<template lang="pug">
div(v-if="agreement")
  DocumentHtmlReader(:html="agreement.html")
</template>

<script setup lang="ts">
  import { COOPNAME } from 'src/shared/config';
  import { useGenerateAgreement } from '../model';
  import { useSessionStore } from 'src/entities/Session';
  import { computed, onMounted } from 'vue';
  import { FailAlert } from 'src/shared/api';
  import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
  import { useAgreementStore } from 'src/entities/Agreement';
  import { SovietContract } from 'cooptypes';
  const session = useSessionStore();

  const { generateAgreement } = useGenerateAgreement();
  const agreementer = useAgreementStore()

  const agreement = computed(() => agreementer.generatedAgreements.find(el => el.meta.registry_id == props.agreement.draft_id))

  const props = defineProps({
    agreement: {
      type: Object as () => SovietContract.Tables.CoopAgreements.ICoopAgreement,
      required: true,
    },
  });

  onMounted(async () => {
    try {
      await generateAgreement(COOPNAME, session.username, Number(props.agreement.draft_id));
    } catch(e: any){
      FailAlert(`Возникла ошибка при генерации соглашения, пожалуйста, обратитесь в поддержку с сообщением: ${e.message}`);
    }

  });
  </script>
