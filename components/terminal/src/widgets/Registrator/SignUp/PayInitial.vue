<template lang='pug'>
div
  q-step(:name='6', title='Оплатите вступительный взнос', :done='step > 6')
    div(v-if='!store.is_paid' )
      p Пожалуйста, совершите оплату регистрационного взноса {{ initialPayment }} {{ CURRENCY }} со своего банковского счёта. Комиссия провайдера {{ feePercent }}%, всего к оплате: {{ toPay }} {{ CURRENCY }}.

      PayWithProvider(:payment-order="store.payment" @payment-fail="paymentFail" @payment-success="paymentSuccess")

    div(v-else).full-width
      p.q-mt-lg.q-mb-lg Ваш платёж успешно принят.
      q-checkbox( v-model='store.agreements.self_paid') я подтверждаю, что совершил оплату со своего банковского счёта

      div.q-mt-lg
        q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!store.agreements.self_paid' @click='next')
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCreateUser } from 'src/features/Registrator/CreateUser'
import { FailAlert } from 'src/shared/api';
import { BASE_PAYMENT_FEE, COOPNAME, CURRENCY } from 'src/shared/config';
import { useCurrentUserStore } from 'src/entities/User';
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useRegistratorStore } from 'src/entities/Registrator'
// import { Yookassa } from 'src/shared/ui/Providers/Yookassa';
import { PayWithProvider } from 'src/shared/ui/PayWithProvider';

const store = useRegistratorStore().state

const emit = defineEmits(['update:data', 'update:step'])
const api = useCreateUser()

const step = computed(() => store.step)
const user = useCurrentUserStore()
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

const initialPayment = computed(() => user.userAccount?.type === 'organization' ? parseFloat(String(coop.publicCooperativeData?.org_registration)) : parseFloat(String(coop.publicCooperativeData?.registration)))

const baseFee = ref(parseFloat(BASE_PAYMENT_FEE))

const toPay = computed(() => {
  return (initialPayment.value / ((100 - baseFee.value) / 100)).toFixed(2)
})

const feePercent = computed(() => {
  // Сумма без учета комиссии
  const amountWithoutFee = initialPayment.value / ((100 - baseFee.value) / 100);
  // Сумма комиссии
  const feeAmount = amountWithoutFee - initialPayment.value;
  // Процент комиссии
  return ((feeAmount / initialPayment.value) * 100).toFixed(2);
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
