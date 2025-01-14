<template lang="pug">
q-btn(@click="showDialog=true" color="primary" size="sm")
  q-icon(name="fa-solid fa-chevron-up").q-mr-sm
  span Совершить взнос
  q-dialog(v-model="showDialog" @hide="clear")
    ModalBase(v-if="!paymentOrder" :title='"Введите сумму"' )
      Form(:handler-submit="handlerSubmit" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="clear").q-pa-sm
        q-input(v-model="quantity" standout="bg-teal text-white" type="number" :min="0" :step="1000" :rules="[val => val > 0 || 'Сумма взноса должна быть положительной']")
          template(#append)
            span.text-overline {{ CURRENCY }}

    ModalBase(v-else :title='"Совершите взнос"' style="min-height: 200px !important;")
      div(style="max-width:400px").q-pa-md
        p Пожалуйста, совершите оплату паевого взноса {{ formatAssetToReadable(paymentOrder.details.amount_without_fee) }}. Комиссия провайдера {{ paymentOrder.details.fact_fee_percent }}%, всего к оплате: {{ paymentOrder.details.amount_plus_fee }}.

        span.text-bold Внимание!
        span.q-ml-xs Оплату необходимо произвести с банковского счета, который принадлежит именно Вам. При поступлении средств с другого счета, оплата будет аннулирована.

      PayWithProvider(:payment-order="paymentOrder" @payment-fail="paymentFail" @payment-success="paymentSuccess").q-mb-md.q-pa-md

  </template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form } from 'src/shared/ui/Form'
import { ModalBase } from 'src/shared/ui/ModalBase'
import { useWalletStore } from 'src/entities/Wallet'
import type { ILoadUserWallet } from 'src/entities/Wallet/model'
import { PayWithProvider } from 'src/shared/ui/PayWithProvider'
import { COOPNAME, CURRENCY } from 'src/shared/config'
import { SuccessAlert, FailAlert } from 'src/shared/api'
import { useSessionStore } from 'src/entities/Session'
import type { IPaymentOrder } from 'src/shared/lib/types/payments'
import { formatAssetToReadable } from 'src/shared/lib/utils/formatAssetToReadable'

const { createDeposit, loadUserWalet } = useWalletStore()

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

const handlerSubmit = async (): Promise<void> => {
  isSubmitting.value = true
  try {
    paymentOrder.value = (await createDeposit({
      quantity: `${parseFloat(quantity.value.toString()).toFixed(4)} ${CURRENCY}`
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
  loadUserWalet({ coopname: COOPNAME, username: session.username as string } as ILoadUserWallet)
  clear()
  SuccessAlert('Платеж успешно принят')
}
</script>
<style scoped>

</style>
