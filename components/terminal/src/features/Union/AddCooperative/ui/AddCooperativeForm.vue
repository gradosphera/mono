<template lang="pug">
Form(:handler-submit="addNow" :is-submitting="isSubmitting" :showCancel="false" :button-cancel-txt="'Отменить'" :button-submit-txt="'Отправить'" @cancel="clear").q-gutter-md
  //- q-input(standout="bg-teal text-white" label="Имя аккаунта" v-model="data.coopname" :rules="[val => notEmpty(val)]")
  q-input(standout="bg-teal text-white" hint="domovoy.com или coop.domovoy.com" label="Домен или поддомен для запуска" v-model="data.params.announce" :rules="[val => notEmpty(val), val => isDomain(val)]")

  q-input(standout="bg-teal text-white" hint="100 RUB" label="Вступительный взнос для физлиц и ИП" v-model="data.params.initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
    template(#append)
      span.text-overline {{CURRENCY}}

  q-input(standout="bg-teal text-white" hint="300 RUB" label="Минимальный паевый взнос для физлиц и ИП" v-model="data.params.minimum" type="number" :min="0" :rules="[val => notEmpty(val)]")
    template(#append)
      span.text-overline {{CURRENCY}}

  q-input(standout="bg-teal text-white" hint="1000 RUB" label="Вступительный взнос для организаций" v-model="data.params.org_initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
    template(#append)
      span.text-overline {{CURRENCY}}

  q-input(standout="bg-teal text-white" hint="3000 RUB" label="Минимальный паевый взнос для организаций" v-model="data.params.org_minimum" type="number" :min="0"  :rules="[val => notEmpty(val)]")
    template(#append)
      span.text-overline {{CURRENCY}}

</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAddCooperative } from '../model';
import { Form } from 'src/shared/ui/Form';
import { notEmpty, isDomain } from 'src/shared/lib/utils';
import { useSessionStore } from 'src/entities/Session';
import { RegistratorContract } from 'cooptypes';
import { CURRENCY } from 'src/shared/config';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import type { IObjectedDocument } from 'src/shared/lib/types/document';

const emit = defineEmits(['finish'])

const {addCooperative} = useAddCooperative()

const isSubmitting = ref(false)

const props = defineProps({
  document: {
    type: Object as () => IObjectedDocument,
    required: true,
  }
})

const document = computed(() => props.document)

const session = useSessionStore()

const data = ref<RegistratorContract.Actions.RegisterCooperative.IRegisterCooperative>({
  coopname: session.username,
  params: {
    is_cooperative: true,
    coop_type: 'conscoop',
    announce: '',
    description: '',
    initial: '',
    minimum: '',
    org_initial: '',
    org_minimum: ''
  },
  username: session.username,
  document: {
    hash: '',
    public_key: '',
    signature: '',
    meta: ''
  }
})

const clear = () => {
  emit('finish')
}

const addNow = async () => {
  try {
    data.value.document = {...document.value, meta: JSON.stringify(document.value.meta)}
    await addCooperative(data.value)
    SuccessAlert('Документ подписан и отправлен')

    clear()
  } catch(e: any){
    FailAlert(e.message)
  }



}

</script>
