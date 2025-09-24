<template lang="pug">
q-card(flat bordered)
  .q-pa-lg
    // Регистрация договора участия
    template(v-if='!isContracted')
      .text-h6.q-mb-md Регистрация договора участия
      .text-body2.q-mb-lg
        | Для участия в системе капитализации необходимо подписать договор участия.
        br
        | Договор определяет ваши права и обязанности как участника кооператива.
      .q-mb-md
        q-btn(
          color='primary'
          label='Согласен с условиями договора'
          :loading='isContractSigning'
          @click='signContract'
        )

    // Соглашение с программой капитализации
    template(v-else-if='!isCapitalProgramAgreed')
      .text-h6.q-mb-md Соглашение о целевой потребительской программе
      .text-body2.q-mb-lg
        | Для участия в программе капитализации необходимо согласиться с условиями целевой потребительской программы.
        br
        | Программа определяет правила накопления и использования капитала.
      .q-mb-md
        q-btn(
          color='primary'
          label='Согласен с условиями программы'
          :loading='isAgreementSigning'
          @click='signAgreement'
        )
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useWalletStore } from 'src/entities/Wallet';
import { CapitalProgramAgreementId } from 'app/extensions/capital/shared/lib';

const contributorStore = useContributorStore();
const walletStore = useWalletStore();

const isContractSigning = ref(false);
const isAgreementSigning = ref(false);

// Computed флаги
const isContracted = computed(() => {
  return !!contributorStore.self?.contract;
});

const isCapitalProgramAgreed = computed(() => {
  return walletStore.agreements.some(agreement => agreement.program_id === CapitalProgramAgreementId);
});

// Имитация подписания договора участия
const signContract = async () => {
  isContractSigning.value = true;
  try {
    // Имитируем задержку для подписания документа
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Договор участия подписан');
    // Здесь должна быть логика реального подписания
  } catch (error) {
    console.error('Ошибка при подписании договора:', error);
  } finally {
    isContractSigning.value = false;
  }
};

// Имитация подписания соглашения с программой
const signAgreement = async () => {
  isAgreementSigning.value = true;
  try {
    // Имитируем задержку для подписания документа
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Соглашение с программой подписано');
    // Здесь должна быть логика реального подписания
  } catch (error) {
    console.error('Ошибка при подписании соглашения:', error);
  } finally {
    isAgreementSigning.value = false;
  }
};
</script>
