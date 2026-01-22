<template lang="pug">
q-step(
  :name='store.steps.PayInitial',
  title='Оплатите вступительный взнос',
  :done='store.isStepDone("PayInitial")'
)
  div(v-if='payment?.payment_details?.amount_without_fee').q-pa-sm
    p Пожалуйста, совершите оплату регистрационного взноса {{ payment.payment_details.amount_without_fee }}. Комиссия провайдера {{ payment.payment_details.fact_fee_percent }}%, всего к оплате: {{ payment.payment_details.amount_plus_fee }}.
    .q-mt-md
      span.text-bold Внимание!
      span.q-ml-xs Оплату необходимо произвести с банковского счета пайщика, который вступает в кооператив. При поступлении средств с другого счета, оплата будет аннулирована, а вступление в кооператив приостановлено.
    PayWithProvider(
      v-if='payment',
      :payment-order='payment',
      @payment-fail='paymentFail',
      @payment-success='paymentSuccess'
    )
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue';
import { useCreateUser } from 'src/features/User/CreateUser';
import { FailAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore();

import { useCooperativeStore } from 'src/entities/Cooperative';
import { useRegistratorStore } from 'src/entities/Registrator';
import { PayWithProvider } from 'src/shared/ui/PayWithProvider';

const store = useRegistratorStore();
const api = useCreateUser();

const step = computed(() => store.state.step);
const coop = useCooperativeStore();
const isCreatingPayment = ref(false);

// Computed property для payment с правильной типизацией
const payment = computed(() => store.state.payment);

const currentStep = store.steps.PayInitial;

// Загружаем данные кооператива один раз при инициализации
coop.loadPublicCooperativeData(info.coopname);

const createInitialPayment = async () => {
  // Защита от повторных вызовов
  if (isCreatingPayment.value || store.state.is_paid) return;

  try {
    isCreatingPayment.value = true;
    await api.createInitialPayment();
  } catch (e: any) {
    FailAlert(
      'Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.',
    );
    console.error(e);
  } finally {
    isCreatingPayment.value = false;
  }
};

// Используем только watch с immediate: true вместо onMounted + watch
watch(step, (newValue) => {
  if (newValue === currentStep) createInitialPayment();
}, { immediate: true });

watch(
  () => store.state.is_paid,
  (newValue) => {
    if (newValue === true) {
      store.state.agreements.self_paid = true;
      store.next();
    }
  },
);

const paymentFail = (): void => {
  FailAlert(
    'Возникла ошибка на этапе оплаты. Попробуйте позже или обратитесь в поддержку.',
  );
};

const paymentSuccess = (): void => {
  store.state.is_paid = true;
};
</script>
