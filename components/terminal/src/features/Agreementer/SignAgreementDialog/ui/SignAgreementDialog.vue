<template lang="pug">
q-dialog(v-model="show" persistent :maximized="true" )
  ModalBase(title='Прочитайте и подпишите документ' :show_close="false")
    div.row.justify-center
      div.col-md-8.col-col-xs-12
        Form(:handler-submit="sign" :is-submitting="isSubmitting" :showCancel="false" :button-submit-txt="'Подписать'" @cancel="clear").q-pa-md
          slot

</template>

<script lang="ts" setup>
import { useAgreementStore } from 'src/entities/Agreement';
import { useWalletStore } from 'src/entities/Wallet';
import { computed, ref } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import type { IGeneratedDocument } from 'src/entities/Document';

const props = defineProps({
  type: {
    type: String,
    required: true,
  }
})


const show = ref(true)
const isSubmitting = ref(false)

const agreementer = useAgreementStore()
const wallet = useWalletStore()

const agreementStore = useAgreementStore()

const user_agreements = computed(() => wallet.agreements)
const all_agreements = computed(() => agreementer.agreementsTemplates)

const sign = () => {
  if (props.type == 'wallet')
    console.log('sign wallet', agreementStore.generatedWalletAgreement)

}

const clear = () => {
  console.log(2)
}

</script>
