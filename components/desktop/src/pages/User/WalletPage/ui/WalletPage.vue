<template lang="pug">
.wallet-page
  WalletProgramWidget
</template>

<script lang="ts" setup>
import { computed, onMounted, markRaw } from 'vue';
import { WalletProgramWidget } from 'src/widgets/Wallet';
import { DepositButton } from 'src/features/Wallet/DepositToWallet';
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet';
import { useHeaderActions } from 'src/shared/hooks';

const headerButtons = computed(() => [
  {
    id: 'wallet-deposit-button',
    component: markRaw(DepositButton),
    order: 1,
  },
  {
    id: 'wallet-withdraw-button',
    component: markRaw(WithdrawButton),
    order: 2,
  },
]);

const { registerAction } = useHeaderActions();

onMounted(() => {
  headerButtons.value.forEach((button) => {
    registerAction(button);
  });
});
</script>

<style lang="scss" scoped>
.wallet-page {
  padding: var(--p-6, 24px);
}

@media (max-width: 768px) {
  .wallet-page {
    padding: var(--p-4, 16px);
  }
}
</style>
