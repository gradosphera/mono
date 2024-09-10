<template lang="pug">
div
  q-btn(@click="showDialog=true" flat icon="add") добавить метод

  q-badge(flat rounded color="grey").q-ml-sm
    q-icon(name="far fa-question")
    q-tooltip Используйте, чтобы добавить метод возврата паевого взноса. Каким именно методом вам вернуть паевый взнос вы сможете выбрать при создании заявления на возврат.

  q-dialog(v-model="showDialog" @hide="clear")
    ModalBase(:title='"Добавить метод платежа"' )
      Form(:handler-submit="handlerSubmit" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-pa-sm
        q-select(v-model="methodType" filled :options="methods" map-options emit-value option-label="title" option-value="value" label="Выберите способ получения платежа" :rules="[val => notEmpty(val)]")

        div(v-if="methodType=='sbp'")
          q-input(v-model="sbp.phone" filled mask="+7 (###) ###-##-##" fill-mask label="Номер телефона" hint="Имя и фамилия получателя должны совпадать с теми, которые указаны в Удостоверении." :rules="[val => notEmpty(val)]" autocomplete="off").q-mb-lg

        div(v-if="methodType=='bank_transfer'")
          q-select(
            v-model="bank_transfer.currency"
            label="Валюта счёта"
            filled
            :options="[{ label: 'RUB', value: 'RUB' }]"
            emit-value
            :rules="[val => notEmpty(val)]"
            map-options
          )
          q-input(
            v-model="bank_transfer.bank_name"
            filled
            label="Наименование банка"
            :rules="[val => notEmpty(val)]"
            autocomplete="off"
          )

          q-input(
            v-model="bank_transfer.details.corr"
            filled
            mask="####################"
            label="Корреспондентский счет"
            :rules="[val => notEmpty(val), val => val.length === 20 || 'ожидаем 20 цифр']"
            autocomplete="off"
          )

          q-input(
            v-model="bank_transfer.details.bik"
            filled
            mask="#########"
            label="БИК"
            :rules="[val => notEmpty(val), val => val.length === 9 || 'ожидаем 9 цифр']"
            autocomplete="off"
          )

          q-input(
            v-model="bank_transfer.details.kpp"
            filled
            mask="#########"
            label="КПП"
            :rules="[val => notEmpty(val), val => val.length === 9 || 'ожидаем 9 цифр']"
            autocomplete="off"
          )

          q-input(
            v-model="bank_transfer.account_number"
            filled
            mask="####################"
            label="Номер счета"
            :rules="[val => notEmpty(val), val => val.length === 20 || 'ожидаем 20 цифр']"
            autocomplete="off"
            hint="Имя и фамилия получателя должны совпадать с теми, которые указаны в Удостоверении."

          ).q-mb-lg



</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAddPaymentMethod } from '../model';
import { FailAlert } from 'src/shared/api';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const username = computed(() => props.username)
const methodType = ref()

const methods = ref([{
  title: 'Система Быстрых Платежей (СБП)',
  value: 'sbp'
}, {
  title: 'Банковский перевод',
  value: 'bank_transfer'
}])

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения'
}

const showDialog = ref(false)
const isSubmitting = ref(false)
const sbp = ref({ phone: '' })

const bank_transfer = ref({
  account_number: '',
  bank_name: '',
  currency: 'RUB',
  details: {
    bik: '',
    corr: '',
    kpp: '',
  }
})

const clear = (): void => {
  showDialog.value = false
  sbp.value = { phone: '' }
  bank_transfer.value = {
    account_number: '',
    bank_name: '',
    currency: 'RUB',
    details: {
      bik: '',
      corr: '',
      kpp: '',
    }
  }
}

const { addPaymentMethod } = useAddPaymentMethod()

const handlerSubmit = async (): Promise<void> => {

  isSubmitting.value = true
  try {
    let data = null as any

    if (methodType.value === 'sbp')
      data = sbp.value
    else if (methodType.value === 'bank_transfer')
      data = bank_transfer.value


    await addPaymentMethod({
      username: username.value,
      method_id: 0, //autogenerate
      method_type: methodType.value,
      data
    })

    showDialog.value = false
    isSubmitting.value = false
    clear()
  } catch (e: any) {
    showDialog.value = false
    isSubmitting.value = false
    FailAlert(e.message)
  }
}

</script>
