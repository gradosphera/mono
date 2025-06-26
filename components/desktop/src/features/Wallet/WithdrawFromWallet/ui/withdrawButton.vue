<template lang="pug">
q-btn(@click='showDialog = true', color='primary')
  q-icon.q-mr-sm(name='fa-solid fa-chevron-down')
  span получить возврат

  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Введите сумму"')
      Form.q-pa-sm(
        :disabled='true',
        :handler-submit='handlerSubmit',
        :is-submitting='isSubmitting',
        :button-cancel-txt='"Отменить"',
        :button-submit-txt='"Продолжить"',
        @cancel='clear'
      )
        q-input(
          v-model='quantity',
          standout='bg-teal text-white',
          type='number',
          :min='0',
          :step='1000',
          :rules='[(val) => val > 0 || "Сумма взноса должна быть положительной"]'
        )
          template(#append)
            span.text-overline {{ currency }}
          //- template(#hint)
            //- span комиссия провайдера {{feePercent}}%, к получению {{toRecieve}}
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { env } from 'src/shared/config';

const currency = computed(() => env.CURRENCY);
const showDialog = ref(false);
const quantity = ref(1000);
const isSubmitting = ref(false);

const clear = (): void => {
  showDialog.value = false;
  isSubmitting.value = false;
  quantity.value = 1000;
};

const handlerSubmit = async (): Promise<void> => {
  isSubmitting.value = true;
  try {
    // await createDeposit({
    //   quantity: quantity.value,
    //   symbol: env.CURRENCY as string,
    //   provider: 'bank',
    // })
    isSubmitting.value = false;
  } catch (e: any) {
    // console.log('e.message', e.message)
    isSubmitting.value = false;
    // FailAlert(e)
  }
};
</script>

<style scoped></style>
