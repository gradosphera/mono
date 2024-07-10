<template lang="pug">
  div.DepositPreparator
    q-btn(color="primary" @click="showDialog=true") Совершить взнос
    q-dialog(v-model="showDialog" @hide="clear")
      ModalBase(v-if="!paymentOrder" :title='"Введите сумму"' )
        Form(:handler-submit="handlerSubmit" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-pa-sm
          q-input(v-model="quantity" filled type="number" :min="0" :step="1000" :rules="[val => val > 0 || 'Сумма взноса должна быть положительной']")
            template(#append)
              p.q-pa-sm {{ CURRENCY }}
            template(#hint)
              span комиссия провайдера {{feePercent}}%, к оплате {{toPay}}
      ModalBase(v-else :title='"Совершите взнос"' style="min-height: 200px !important;")
        template(v-if="paymentOrder.provider == 'yookassa'")
          Yookassa(:payment-order="paymentOrder" @payment-fail="paymentFail" @payment-success="paymentSuccess")

  </template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Form } from 'src/shared/ui/Form'
import { ModalBase } from 'src/shared/ui/ModalBase'
import { useWalletStore } from 'src/entities/Wallet'
import type { ILoadUserWallet, IPaymentOrder } from 'src/entities/Wallet/model'
import { Yookassa } from '../Yookassa'

import { BASE_PAYMENT_FEE, COOPNAME, CURRENCY } from 'src/shared/config'
import { SuccessAlert, FailAlert } from 'src/shared/api'
import { useSessionStore } from 'src/entities/Session'

const { createDeposit, update } = useWalletStore()

//TODO move username to Session entity
const session = useSessionStore()
const quantity = ref(1000)
const showDialog = ref(false)
const isSubmitting = ref(false)
const paymentOrder = ref()

const clear = (): void => {
  showDialog.value = false
  isSubmitting.value = false
  paymentOrder.value = null
  quantity.value = 1000
}

const baseFee = parseFloat(BASE_PAYMENT_FEE)


const toPay = computed(() => {
  return (quantity.value / ((100 - baseFee) / 100)).toFixed(2)
})

const feePercent = computed(() => {
  // Сумма без учета комиссии
  const amountWithoutFee = quantity.value / ((100 - baseFee) / 100);
  // Сумма комиссии
  const feeAmount = amountWithoutFee - quantity.value;
  // Процент комиссии
  return ((feeAmount / quantity.value) * 100).toFixed(2);
})

const handlerSubmit = async (): Promise<void> => {
  isSubmitting.value = true
  try {
    paymentOrder.value = (await createDeposit({
      quantity: `${parseFloat(quantity.value.toString()).toFixed(4)} ${CURRENCY}`,
      provider: 'yookassa',
    })) as IPaymentOrder
    isSubmitting.value = false
  } catch (e: any) {
    console.log('e.message', e.message)
    isSubmitting.value = false
    FailAlert(e.message)
  }
}

const paymentFail = (): void => {
  clear()
  FailAlert('Произошла ошибка при приёме платежа')
}

const paymentSuccess = (): void => {
  update({ coopname: COOPNAME, username: session.username as string } as ILoadUserWallet)
  clear()
  SuccessAlert('Платеж успешно принят')
}
</script>
