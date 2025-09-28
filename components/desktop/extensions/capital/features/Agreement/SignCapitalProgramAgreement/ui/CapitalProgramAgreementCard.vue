<template lang="pug">
.q-mb-md
  .text-h6.q-mb-md Соглашение о целевой потребительской программе
  .text-body2.q-mb-lg
    | Для участия в программе капитализации необходимо согласиться с условиями целевой потребительской программы.
    br
    | Программа определяет правила накопления и использования капитала.
  .q-mb-md
    q-btn(
      color='primary'
      label='Согласен с условиями программы'
      :loading='isSigning'
      @click='signAgreement'
    )
</template>

<script lang="ts" setup>
import { useSignCapitalProgramAgreement } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api';

const {
  signAndSendAgreement,
  isSigning
} = useSignCapitalProgramAgreement();

// Подписание соглашения о целевой потребительской программе
const signAgreement = async () => {
  try {
    await signAndSendAgreement();
    SuccessAlert('Соглашение о целевой потребительской программе успешно подписано');
  } catch (error) {
    console.error('Ошибка при подписании соглашения:', error);
    FailAlert(error);
  }
};
</script>
