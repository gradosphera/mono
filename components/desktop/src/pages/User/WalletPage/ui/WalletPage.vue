<template lang="pug">
.wallet-page
  WalletProgramWidget

//- Действия страницы в шапке — через canon Teleport в слот-host шапки.
//- defer: target (#header-actions-host) живёт в layout-шапке, смонтированной
//- раньше страницы. Сами кнопки сами решают свою видимость (DepositButton
//- скрыт, пока пайщик не принят — status !== 'active').
Teleport(to='#header-actions-host', defer)
  DepositButton
  WithdrawButton
</template>

<script lang="ts" setup>
import { WalletProgramWidget } from 'src/widgets/Wallet';
import { DepositButton } from 'src/features/Wallet/DepositToWallet';
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet';
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
