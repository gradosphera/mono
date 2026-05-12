<template lang="pug">
div.offer-gate
  div(v-if='isLoading').full-width.text-center.q-mt-md.q-mb-md
    Loader(text='Проверяем доступ к программе...')

  div(v-else-if='error').q-pa-md
    q-banner.bg-negative.text-white(rounded)
      template(#avatar)
        q-icon(name='warning', color='white')
      | Не удалось проверить подпись оферты «{{ props.offerTitle }}». Попробуйте обновить страницу.

  div(v-else-if='isBlocked').q-pa-md
    q-banner.bg-warning.text-dark(rounded)
      template(#avatar)
        q-icon(name='lock', color='dark')
      .text-subtitle1.q-mb-sm
        | Чтобы участвовать в программе «{{ props.offerTitle }}», подпишите её оферту.
      .text-body2
        | Это разовое действие — подписав оферту, вы сможете пользоваться программой без ограничений.
      template(#action)
        q-btn(
          color='primary',
          unelevated,
          label='Перейти к подписанию',
          @click='goToSignup'
        )

  slot(v-else)
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Loader } from 'src/shared/ui/Loader';
import type { OfferGateProps } from '../model/types';
import { useOfferGate } from '../api/useOfferGate';

const props = defineProps<OfferGateProps>();
const router = useRouter();

const { isLoading, hasSigned, isBlocked, error } = useOfferGate(() => ({
  coopname: props.coopname,
  username: props.username,
  agreementType: props.agreementType,
  offerTitle: props.offerTitle,
  signupUrl: props.signupUrl,
}));

const goToSignup = () => {
  void router.push(props.signupUrl || '/signup');
};

defineExpose({ isLoading, hasSigned, isBlocked, error });
</script>

<style lang="scss" scoped>
.offer-gate {
  width: 100%;
}
</style>
