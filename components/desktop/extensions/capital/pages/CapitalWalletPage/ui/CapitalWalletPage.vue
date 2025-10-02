<template lang="pug">
.q-pa-md
  // Кошелек и информация (доступно только полностью зарегистрированным пользователям)
  // Кошелек
  .row.q-mb-lg
    .col-md-6.col-xs-12.q-pa-xs
      WalletWidget

    // Информация о контрибьюторе
    .col-md-6.col-xs-12.q-pa-xs
      ContributorInfoWidget
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { WalletWidget } from 'src/widgets/Wallet';
import { ContributorInfoWidget } from 'app/extensions/capital/widgets';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';

const router = useRouter();
const contributorStore = useContributorStore();

// Проверка полной регистрации (есть контракт И есть соглашение с программой)
const isFullyRegistered = computed(() => {
  return contributorStore.isGenerationAgreementCompleted && contributorStore.isCapitalAgreementCompleted;
});

// Функция перенаправления на регистрацию
const redirectToRegistration = () => {
  if (!isFullyRegistered.value) {
    router.replace({ name: 'capital-registration' });
  }
};

// Проверяем при монтировании и следим за изменениями
onMounted(() => {
  redirectToRegistration();
});

watch(isFullyRegistered, () => {
  redirectToRegistration();
});
</script>


