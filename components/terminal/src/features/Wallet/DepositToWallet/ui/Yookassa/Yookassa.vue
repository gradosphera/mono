<script lang="ts" setup>
import { onMounted } from 'vue'
import type { IPaymentOrder } from 'src/entities/Wallet'

const props = defineProps<{
  paymentOrder: IPaymentOrder
}>()

const emit = defineEmits(['paymentSuccess', 'paymentFail'])

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'
  script.async = true
  document.head.appendChild(script)

  script.onload = () => {
    // Инициализация виджета после загрузки скрипта
    const checkout = new window.YooMoneyCheckoutWidget({
      confirmation_token: props.paymentOrder.details.token,

      //Настройка виджета
      // customization: {
      //Выбор способа оплаты для отображения
      // payment_methods: ['sbp']
      // },
      error_callback: function (error: any) {
        // Обработка ошибок инициализации
        emit('paymentFail')

        console.error(error)
      },
    })

    // Отображение платежной формы в контейнере
    checkout.render('paymentForm').then(() => {
      // Код, который нужно выполнить после отображения платежной формы.
    })

    checkout.on('success', () => {
      //Код, который нужно выполнить после успешной оплаты.
      emit('paymentSuccess')
      //Удаление инициализированного виджета
      checkout.destroy()
    })

    checkout.on('fail', () => {
      //Код, который нужно выполнить после неудачной оплаты.
      emit('paymentFail')
      //Удаление инициализированного виджета
      checkout.destroy()
    })
  }
  script.onerror = () => {
    console.error('Ошибка при загрузке скрипта ЮKassa')
  }
})
</script>

<template lang="pug">
#paymentForm.Yookassa.full-width
</template>
