<template lang="pug">
q-card.main-wallet-card.q-pa-lg(flat)
  .wallet-header
    .wallet-icon
      q-icon(name='account_balance_wallet', size='32px', color='primary')
    .wallet-title
      .title {{ walletStore.program_wallets[0]?.program_details?.title || 'Цифровой кошелек' }}

  .wallet-balance
    ColorCard(color='blue').main-balance
      .balance-label Доступно
      .balance-value {{ walletStore.program_wallets[0]?.available || '0' }}

    ColorCard(
      color='orange'
      v-if='walletStore.program_wallets[0]?.blocked && walletStore.program_wallets[0]?.blocked !== "0"'
    ).blocked-balance
      .balance-label Заблокировано
      .balance-value {{ walletStore.program_wallets[0]?.blocked }}

  .wallet-actions
    .row
      .col-6.q-pa-sm
        DepositButton.full-width.action-btn
      .col-6.q-pa-sm
        WithdrawButton.full-width.action-btn
</template>

<script lang="ts" setup>
import { DepositButton } from 'src/features/Wallet/DepositToWallet';
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet';
import { useWalletStore } from 'src/entities/Wallet';
import { ColorCard } from 'src/shared/ui';

const walletStore = useWalletStore();
</script>

<style lang="scss" scoped>

// Основной кошелек
.main-wallet-card {
  .wallet-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .wallet-icon {
      margin-right: 16px;
    }

    .wallet-title {
      .title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .subtitle {
        font-size: 14px;
      }
    }
  }

  .wallet-balance {
    margin-bottom: 32px;

    .main-balance,
    .blocked-balance {
      // Переопределяем размеры шрифтов для сохранения оригинального дизайна
      .balance-label {
        font-size: 14px;
        margin-bottom: 6px;
        opacity: 0.6;
      }

      .balance-value {
        font-size: 24px;
        font-weight: 700;
      }
    }

    .main-balance {
      padding: 20px; // Больше padding для основного баланса
    }

    .blocked-balance {
      padding: 16px; // Меньше padding для заблокированного баланса
    }
  }

  .wallet-actions {
    .action-btn {
      border-radius: 10px;
      padding: 12px 0;
      font-weight: 500;
    }
  }
}
</style>
