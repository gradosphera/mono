<template lang="pug">
q-dialog(v-model="show" persistent :maximized="true" )
  ModalBase(:title="title" :show_close="false")
    div.row.justify-center
      div(style="padding-bottom: 100px;").col-md-8.col-col-xs-12
        Loader(v-if="isLoading" :text='`Формируем документ...`')
        Form(:handler-submit="sign" :is-submitting="isSubmitting" :showSubmit="!isLoading" :showCancel="false" :button-submit-txt="'Подписать и отправить'" @cancel="clear").q-pa-md
          slot
</template>

<script lang="ts" setup>
import { useAgreementStore } from 'src/entities/Agreement';
import { computed, ref } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { SovietContract } from 'cooptypes';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSignAgreement } from '../model';
import { useWalletStore } from 'src/entities/Wallet';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { useSessionStore } from 'src/entities/Session';
import { Loader } from 'src/shared/ui/Loader';

const session = useSessionStore()
const title = computed(() => props.is_modify ? 'Прочитайте и подпишите обновлённый документ' : 'Прочитайте и подпишите документ')

const props = defineProps({
  agreement: {
    type: Object as () => SovietContract.Tables.CoopAgreements.ICoopAgreement,
    required: true,
  },
  is_modify: {
    type: Boolean,
    required: true
  }
})

const show = ref(true)
const isSubmitting = ref(false)
const isLoading = computed(() => agreementOnSign.value ? false : true)

const {signAgreement} = useSignAgreement()

const agreementStore = useAgreementStore()
const agreementOnSign = computed(() => agreementStore.generatedAgreements.find(el => el.meta.registry_id == props.agreement.draft_id))

const sign = async () => {

  if (!agreementOnSign.value){
    FailAlert('Возникла ошибка подписи документа');
    return
  }

  try {
    isSubmitting.value = true
    await signAgreement(props.agreement.type, agreementOnSign.value)
    await useWalletStore().loadUserWallet({coopname: info.coopname, username: session.username})
    isSubmitting.value = false
    show.value = false
    SuccessAlert('Документ принят')
  } catch(e: any){
    isSubmitting.value = false
    console.error(e)
    FailAlert(`Ошибка подписи документа: ${e.message}`)
  }

}

const clear = () => {
  console.log(2)
}

</script>
