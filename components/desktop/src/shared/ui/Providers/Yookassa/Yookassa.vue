<script lang="ts" setup>
import type {
  IPaymentOrder,
  IInitialPaymentOrder,
} from 'src/shared/lib/types/payments';
import { onMounted } from 'vue';

const props = defineProps<{
  paymentOrder: IPaymentOrder | IInitialPaymentOrder;
}>();

const emit = defineEmits(['paymentSuccess', 'paymentFail']);

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    // Инициализация виджета после загрузки скрипта
    const checkout = new window.YooMoneyCheckoutWidget({
      confirmation_token: props.paymentOrder.payment_details?.data,

      error_callback: function (error: any) {
        // Обработка ошибок инициализации
        emit('paymentFail');

        console.error(error);
      },
    });

    // Отображение платежной формы в контейнере
    checkout.render('paymentForm').then(() => {
      // Код, который нужно выполнить после отображения платежной формы.
    });

    checkout.on('success', () => {
      //Код, который нужно выполнить после успешной оплаты.
      emit('paymentSuccess');
      //Удаление инициализированного виджета
      checkout.destroy();
    });

    checkout.on('fail', () => {
      //Код, который нужно выполнить после неудачной оплаты.
      emit('paymentFail');
      //Удаление инициализированного виджета
      checkout.destroy();
    });
  };
  script.onerror = () => {
    console.error('Ошибка при загрузке скрипта ЮKassa');
  };
});
</script>

<template lang="pug">
#paymentForm.Yookassa.full-width
</template>
