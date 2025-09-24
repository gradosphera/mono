<template lang="pug">
.q-pa-md
  // Регистрация (если не зарегистрирован или нет соглашения с программой)
  template(v-if='!isFullyRegistered')
    CapitalRegistrationWidget

  // Кошелек и информация (если полностью зарегистрирован)
  template(v-else)
    // Кошелек
    .row.q-mb-lg
      .col-md-6.col-xs-12.q-pa-xs
        WalletWidget

      // Информация о контрибьюторе
      .col-md-6.col-xs-12.q-pa-xs
        ContributorInfoWidget


</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { WalletWidget } from 'src/widgets/Wallet';
import { ContributorInfoWidget, CapitalRegistrationWidget } from 'app/extensions/capital/widgets';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useWalletStore } from 'src/entities/Wallet';
import { CapitalProgramAgreementId } from 'app/extensions/capital/shared/lib';

const contributorStore = useContributorStore();
const walletStore = useWalletStore();

// Проверка полной регистрации (есть контракт И есть соглашение с программой)
const isFullyRegistered = computed(() => {
  const hasContract = !!contributorStore.self?.contract;
  const hasCapitalAgreement = walletStore.agreements.some(agreement => agreement.program_id === CapitalProgramAgreementId);
  return hasContract && hasCapitalAgreement;
});
</script>


