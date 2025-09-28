<template lang="pug">
q-card(flat bordered)
  .q-pa-lg
    // Регистрация договора участия
    ParticipationAgreementCard(v-if='!isContracted')

    // Соглашение с программой капитализации
    CapitalProgramAgreementCard(v-else-if='!isCapitalProgramAgreed')
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useWalletStore } from 'src/entities/Wallet';
import { CapitalProgramAgreementId } from 'app/extensions/capital/shared/lib';
import { ParticipationAgreementCard } from 'app/extensions/capital/features/Contributor/RegisterContributor';
import { CapitalProgramAgreementCard } from 'app/extensions/capital/features/Agreement/SignCapitalProgramAgreement';

const contributorStore = useContributorStore();
const walletStore = useWalletStore();

// Computed флаги для управления видимостью компонентов
const isContracted = computed(() => {
  return !!contributorStore.self?.contract;
});

const isCapitalProgramAgreed = computed(() => {
  return walletStore.agreements.some(agreement => agreement.program_id === CapitalProgramAgreementId);
});
</script>
