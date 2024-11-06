<template lang='pug'>
div(v-if="store.payment?.details?.amount_without_fee")
  q-step(:name='6', title='Оплатите вступительный взнос', :done='step > 6')
    div(v-if="store.payment.details")

      p Пожалуйста, совершите оплату регистрационного взноса {{ formatAssetToReadable(store.payment.details.amount_without_fee) }}. Комиссия провайдера {{ store.payment.details.fact_fee_percent }}%, всего к оплате: {{ store.payment.details.amount_plus_fee }}.
      div.q-mt-md
        span.text-bold Внимание!
        span.q-ml-xs Оплату необходимо произвести с банковского счета, который принадлежит именно Вам. При поступлении средств с другого счета, оплата будет аннулирована, а вступление в кооператив приостановлено.
      PayWithProvider(:payment-order="store.payment" @payment-fail="paymentFail" @payment-success="paymentSuccess")

</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from 'vue'
import { useCreateUser } from 'src/features/Registrator/CreateUser'
import { FailAlert } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config';
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useRegistratorStore } from 'src/entities/Registrator'
import { PayWithProvider } from 'src/shared/ui/PayWithProvider';
import { formatAssetToReadable } from 'src/shared/lib/utils/formatAssetToReadable';
const store = useRegistratorStore().state

const emit = defineEmits(['update:data', 'update:step'])
const api = useCreateUser()

const step = computed(() => store.step)
const coop = useCooperativeStore()

const currentStep = 6

onMounted(async () => {
  await coop.loadPublicCooperativeData(COOPNAME)

  if (step.value === currentStep)
    createInitialPayment()
})

watch(step, (newValue) => {
  if (newValue === currentStep)
    createInitialPayment()
})

watch(() => store.is_paid, (newValue) => {
  if (newValue === true){
    store.agreements.self_paid = true
    next()
  }
})

// const confirmation_token = computed(() => store.payment.details.token)

const createInitialPayment = async () => {
  try {
    if (!store.is_paid) {
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
  store.is_paid = true
}


const next = () => {
  emit('update:step', step.value + 1)
}
</script>
