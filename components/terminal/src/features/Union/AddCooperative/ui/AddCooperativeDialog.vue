<template lang="pug">
div
  q-btn(@click="showAdd=true") Добавить
  q-dialog(v-model="showAdd" persistent :maximized="false" )
    ModalBase(:title='"Добавить кооператив"' )
      Form(:handler-submit="addNow" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Добавить'" @cancel="clear").q-pa-md
        q-input(filled label="Имя аккаунта" v-model="data.coopname" :rules="[val => notEmpty(val)]")
        q-input(filled label="Краткое описание" v-model="data.params.description" type="textarea" :rules="[val => notEmpty(val)]")

        q-input(filled label="Вступительный взнос для физлиц и ИП" v-model="data.params.initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
          template(#append)
            p {{CURRENCY}}

        q-input(filled label="Минимальный паевый взнос для физлиц и ИП" v-model="data.params.minimum" type="number" :min="0" :rules="[val => notEmpty(val)]")
          template(#append)
            p {{CURRENCY}}

        q-input(filled label="Вступительный взнос для организаций" v-model="data.params.org_initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
          template(#append)
            p {{CURRENCY}}

        q-input(filled label="Минимальный паевый взнос для организаций" v-model="data.params.org_minimum" type="number" :min="0"  :rules="[val => notEmpty(val)]")
          template(#append)
            p {{CURRENCY}}

</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useAddCooperative } from '../model';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { notEmpty } from 'src/shared/lib/utils';
import { useSessionStore } from 'src/entities/Session';
import { RegistratorContract } from 'cooptypes';
import { CURRENCY } from 'src/shared/config';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useLoadCooperatives } from '../../LoadCooperatives';

const {addCooperative} = useAddCooperative()

const showAdd = ref(false)
const isSubmitting = ref(false)

const session = useSessionStore()

const data = ref<RegistratorContract.Actions.RegisterCooperative.IRegisterCooperative>({
    registrator: session.username,
    coopname: '',
    params: {
      is_cooperative: true,
      coop_type: 'conscoop',
      announce: '',
      description: '',
      initial: '',
      minimum: '',
      org_initial: '',
      org_minimum: ''
    }
  })

const clear = () => {
  showAdd.value= false

  data.value = {
    registrator: session.username,
    coopname: '',
    params: {
      is_cooperative: true,
      coop_type: 'conscoop',
      announce: '',
      description: '',
      initial: '',
      minimum: '',
      org_initial: '',
      org_minimum: ''
    }
  }
}

const addNow = async () => {
  const {loadCooperatives} = useLoadCooperatives()
  try {
    await addCooperative(data.value)
    SuccessAlert('Кооператив добавлен')
    loadCooperatives()

    clear()
  } catch(e: any){
    FailAlert(e.message)
  }



}

</script>
