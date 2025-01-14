<template lang='pug'>
div(v-if="store?.state?.payment?.details?.amount_without_fee")
  q-step(:name='store.steps.PayInitial', title='Оплатите вступительный взнос', :done='store.isStepDone("PayInitial")')
    div(v-if="store.state.payment.details")
      p Пожалуйста, совершите оплату регистрационного взноса {{ formatAssetToReadable(store.state.payment.details.amount_without_fee) }}. Комиссия провайдера {{ store.state.payment.details.fact_fee_percent }}%, всего к оплате: {{ store.state.payment.details.amount_plus_fee }}.
      div.q-mt-md
        span.text-bold Внимание!
        span.q-ml-xs Оплату необходимо произвести с банковского счета, который принадлежит именно Вам. При поступлении средств с другого счета, оплата будет аннулирована, а вступление в кооператив приостановлено.
      PayWithProvider(:payment-order="store.state.payment" @payment-fail="paymentFail" @payment-success="paymentSuccess")

</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from 'vue'
import { useCreateUser } from 'src/features/User/CreateUser'
import { FailAlert } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config';
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useRegistratorStore } from 'src/entities/Registrator'
import { PayWithProvider } from 'src/shared/ui/PayWithProvider';
import { formatAssetToReadable } from 'src/shared/lib/utils/formatAssetToReadable';
const store = useRegistratorStore()

const api = useCreateUser()

const step = computed(() => store.state.step)
const coop = useCooperativeStore()

const currentStep = store.steps.PayInitial

onMounted(async () => {
  await coop.loadPublicCooperativeData(COOPNAME)

  if (step.value === currentStep)
    createInitialPayment()
})

watch(step, (newValue) => {
  if (newValue === currentStep)
    createInitialPayment()
})

watch(() => store.state.is_paid, (newValue) => {
  if (newValue === true){
    store.state.agreements.self_paid = true
    store.next()
  }
})

const createInitialPayment = async () => {
  try {
    if (!store.state.is_paid) {
      await api.createInitialPayment()
    }
  } catch (e: any) {
    FailAlert('Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.')
    console.error(e)
  }
}

const paymentFail = (): void => {
  FailAlert('Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.')
}

const paymentSuccess = (): void => {
  store.state.is_paid = true
}


</script>
