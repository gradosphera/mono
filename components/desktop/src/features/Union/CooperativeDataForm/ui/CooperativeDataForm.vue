<template lang="pug">
div
  Form(:handler-submit="saveData" :showCancel="false" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-gutter-md
    q-input(standout="bg-teal text-white" hint="domovoy.com или coop.domovoy.com" label="Домен или поддомен для запуска" v-model="formData.announce" :rules="[val => notEmpty(val), val => isDomain(val)]")

    q-input(standout="bg-teal text-white" placeholder="100" label="Вступительный взнос для физлиц и ИП" v-model="formData.initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB

    q-input(standout="bg-teal text-white" label="Минимальный паевый взнос для физлиц и ИП" placeholder="300" v-model="formData.minimum" type="number" :min="0" :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB

    q-input(standout="bg-teal text-white" placeholder="1000" label="Вступительный взнос для организаций" v-model="formData.org_initial" type="number" :min="0" :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB

    q-input(standout="bg-teal text-white" placeholder="3000" label="Минимальный паевый взнос для организаций" v-model="formData.org_minimum" type="number" :min="0"  :rules="[val => notEmpty(val)]")
      template(#append)
        span.text-overline RUB
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Form } from 'src/shared/ui/Form';
import { notEmpty, isDomain } from 'src/shared/lib/utils';
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement';
import type { ICooperativeFormData } from 'src/entities/ConnectionAgreement/model/types';


const emit = defineEmits(['continue'])

const connectionAgreement = useConnectionAgreementStore()

// Локальное состояние формы для избежания проблем с реактивностью
const formData = ref<ICooperativeFormData>({
  announce: connectionAgreement.formData.announce || '',
  initial: connectionAgreement.formData.initial || '',
  minimum: connectionAgreement.formData.minimum || '',
  org_initial: connectionAgreement.formData.org_initial || '',
  org_minimum: connectionAgreement.formData.org_minimum || ''
})

// Синхронизируем локальное состояние с изменениями в store
watch(() => connectionAgreement.formData, (newFormData) => {
  formData.value = {
    announce: newFormData.announce || '',
    initial: newFormData.initial || '',
    minimum: newFormData.minimum || '',
    org_initial: newFormData.org_initial || '',
    org_minimum: newFormData.org_minimum || ''
  }
}, { deep: true })

// Синхронизируем локальное состояние с store при изменении
const syncFormData = () => {
  connectionAgreement.setFormData(formData.value)
}

const clear = () => {
  emit('continue')
}

const saveData = async () => {
  console.log('📤 CooperativeDataForm: Данные формы:', formData.value)
  // Синхронизируем данные с store перед отправкой
  syncFormData()
  emit('continue', formData.value)
}
</script>
