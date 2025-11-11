<template lang="pug">
div
  Form(:handler-submit="saveData" :showCancel="false" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-gutter-md
    q-input(standout="bg-teal text-white" hint="domovoy.com или coop.domovoy.com" label="Домен или поддомен для запуска" v-model="connectionAgreement.formData.announce" :rules="[val => notEmpty(val), val => isDomain(val)]")

    q-input(standout="bg-teal text-white" hint="100 RUB" label="Вступительный взнос для физлиц и ИП" v-model="connectionAgreement.formData.initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB

    q-input(standout="bg-teal text-white" label="Минимальный паевый взнос для физлиц и ИП" hint="300 RUB" v-model="connectionAgreement.formData.minimum" type="number" :min="0" :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB

    q-input(standout="bg-teal text-white" hint="1000 RUB" label="Вступительный взнос для организаций" v-model="connectionAgreement.formData.org_initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB

    q-input(standout="bg-teal text-white" hint="3000 RUB" label="Минимальный паевый взнос для организаций" v-model="connectionAgreement.formData.org_minimum" type="number" :min="0"  :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB
</template>
<script lang="ts" setup>
import { Form } from 'src/shared/ui/Form';
import { notEmpty, isDomain } from 'src/shared/lib/utils';
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement';


const emit = defineEmits(['continue'])

const connectionAgreement = useConnectionAgreementStore()

// Данные напрямую из стора (уже инициализированы с дефолтными значениями)

const clear = () => {
  emit('continue')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const saveData = async (e?: Event) => {
  console.log('📤 CooperativeDataForm: Данные формы:', connectionAgreement.formData)
  // Данные уже сохранены в сторе напрямую
  emit('continue', connectionAgreement.formData)
}
</script>
