<template lang='pug'>
div
  q-step(:name='6', title='Оплатите вступительный взнос', :done='step > 6')
    div(v-if='!store.is_paid' )
      p Пожалуйста, совершите оплату регистрационного взноса {{ initialPayment }} {{ CURRENCY }} со своего банковского счёта. Комиссия провайдера {{ feePercent }}%, всего к оплате: {{ toPay }} {{ CURRENCY }}.

      div(id='paymentForm').full-width

    div(v-else).full-width
      p.q-mt-lg.q-mb-lg Ваш платёж успешно принят.
      q-checkbox( v-model='store.agreements.self_paid') я подтверждаю, что совершил оплату со своего банковского счёта

      div.q-mt-lg
        q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!store.agreements.self_paid' @click='next')
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCreateUser, createUserStore as store } from 'src/features/User/CreateUser'
import { FailAlert } from 'src/shared/api';
import { BASE_PAYMENT_FEE, COOPNAME, CURRENCY } from 'src/shared/config';
import { LocalStorage } from 'quasar';
import { useCurrentUserStore } from 'src/entities/User';
import { useCooperativeStore } from 'src/entities/Cooperative';

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


const confirmation_token = computed(() => store.payment.details.token)

const createInitialPayment = async () => {
  try {
    console.log('currentStep', currentStep)
    console.log('step', step.value)
    if (!store.is_paid) {
      await api.createInitialPayment()
      initWidget()
    }
  } catch (e: any) {
    FailAlert('Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.')
    console.error(e)
  }
}

const initWidget = () => {
  const script = document.createElement('script')
  script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
  script.async = true
  document.head.appendChild(script)

  script.onload = () => {
    // Инициализация виджета после загрузки скрипта
    const checkout = new window.YooMoneyCheckoutWidget({
      confirmation_token: confirmation_token.value,
      error_callback: function (error: any) {
        FailAlert('Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.')
        console.error(error)
      }
    })

    // Отображение платежной формы в контейнере
    checkout.render('paymentForm')
      .then(() => {
        // Код, который нужно выполнить после отображения платежной формы.
      })

    checkout.on('success', () => {
      //Код, который нужно выполнить после успешной оплаты.
      store.is_paid = true
      LocalStorage.setItem(`${COOPNAME}:is_paid`, true)

      //Удаление инициализированного виджета
      checkout.destroy();
    });


    checkout.on('fail', () => {
      //Код, который нужно выполнить после неудачной оплаты.
      FailAlert('Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.')
      //Удаление инициализированного виджета
      checkout.destroy();
    });

  }

  script.onerror = () => {
    console.error('Ошибка при загрузке скрипта ЮKassa')
  }
}

const next = () => {
  emit('update:step', step.value + 1)
}
</script>
