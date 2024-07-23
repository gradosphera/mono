<template lang="pug">
div
  q-btn(color="primary" @click="showDialog = true") получить возврат

  q-dialog(v-model="showDialog" @hide="clear")
    ModalBase( :title='"Введите сумму"' )
      Form(:handler-submit="handlerSubmit" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-pa-sm
        q-input(v-model="quantity" filled type="number" :min="0" :step="1000" :rules="[val => val > 0 || 'Сумма взноса должна быть положительной']")
          template(#append)
            p.q-pa-sm {{ CURRENCY }}
          template(#hint)
            span комиссия провайдера {{feePercent}}%, к получению {{toRecieve}}

</template>
<script setup lang="ts">

import { computed, ref } from 'vue';
import { CURRENCY } from 'src/shared/config';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';

const showDialog = ref(false)
const quantity = ref(1000)
const isSubmitting = ref(false)

const clear = (): void => {
  showDialog.value = false
  isSubmitting.value = false
  quantity.value = 1000
}

const feePercent = ref(0.7)

const toRecieve = computed(() => {
  // Процент комиссии
  if (quantity.value > 0)
    return (quantity.value - quantity.value * feePercent.value / 100).toFixed(2);
  else return 0
})


const handlerSubmit = async (): Promise<void> => {
  isSubmitting.value = true
  try {
    // paymentOrder.value = (await createDeposit({
    //   quantity: `${parseFloat(quantity.value.toString()).toFixed(4)} ${CURRENCY}`,
    //   provider: 'yookassa',
    // })) as IPaymentOrder
    isSubmitting.value = false
  } catch (e: any) {
    // console.log('e.message', e.message)
    isSubmitting.value = false
    // FailAlert(e.message)
  }
}


</script>
