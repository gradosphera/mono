<template lang="pug">
.q-pa-md
  .row
    // Левая колонка - Цифровой кошелек (основной)
    .col-md-5.col-xs-12.q-pa-sm
      q-card.main-wallet-card.q-pa-lg(flat)
        .wallet-header
          .wallet-icon
            q-icon(name='account_balance_wallet', size='32px', color='primary')
          .wallet-title
            .title {{ walletStore.program_wallets[0]?.program_details?.title || 'Цифровой кошелек' }}

        .wallet-balance
          .main-balance
            .balance-label Доступно
            .balance-value {{ walletStore.program_wallets[0]?.available || '0' }}

          .blocked-balance(
            v-if='walletStore.program_wallets[0]?.blocked && walletStore.program_wallets[0]?.blocked !== "0"'
          )
            .balance-label Заблокировано
            .balance-value {{ walletStore.program_wallets[0]?.blocked }}

        .wallet-actions
          .row
            .col-6.q-pa-sm
              DepositButton.full-width.action-btn
            .col-6.q-pa-sm
              WithdrawButton.full-width.action-btn

    // Правая колонка - Целевые программы
    .col-md-7.col-xs-12.q-pa-sm
      q-card.programs-card.q-pa-lg(flat)
        .programs-header
          .programs-icon
            q-icon(name='savings', size='24px', color='teal')
          .programs-title Целевые потребительские программы

        .programs-list(v-if='otherPrograms.length > 0')
          .program-item(v-for='program in otherPrograms', :key='program.id')
            .program-info
              .program-name {{ program.program_details.title }}
              .program-balances
                .balance-item
                  .label Доступно
                  .value {{ program.available || '0' }}
                .balance-item(
                  v-if='program.blocked && program.blocked !== "0"'
                )
                  .label Заблокировано
                  .value {{ program.blocked }}

        .empty-programs(v-else)
          .empty-icon
            q-icon(name='inbox', size='48px', color='grey-5')
          .empty-text Целевые программы пока не подключены

  // Минимальный неснижаемый остаток (в конце)
  .row.q-mt-md(v-if='currentUser.participantAccount.value?.minimum_amount')
    .col-12
      q-card.minimum-balance-card.q-pa-md(flat)
        .minimum-balance-info
          .info-icon
            q-icon(name='lock', size='16px', color='orange')
          .info-content
            .info-label Минимальный неснижаемый остаток
            .info-value {{ currentUser.participantAccount.value?.minimum_amount }}
</template>

<script lang="ts" setup>
import { DepositButton } from 'src/features/Wallet/DepositToWallet';
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet';
import { useWalletStore } from 'src/entities/Wallet';
import { useCurrentUser } from 'src/entities/Session';
import { computed } from 'vue';
import 'src/shared/ui/CardStyles';

const walletStore = useWalletStore();
const currentUser = useCurrentUser();

// Остальные программы (кроме первой - цифрового кошелька)
const otherPrograms = computed(() => {
  return walletStore.program_wallets.slice(1);
});
</script>

<style lang="scss" scoped>
// Основные карточки
.main-wallet-card,
.programs-card,
.minimum-balance-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .q-dark & {
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

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

    .main-balance {
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 12px;
      background: rgba(25, 118, 210, 0.08);
      border-left: 4px solid #1976d2;
      transition: all 0.2s ease;

      .q-dark & {
        background: rgba(25, 118, 210, 0.15);
      }

      &:hover {
        background: rgba(25, 118, 210, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);

        .q-dark & {
          background: rgba(25, 118, 210, 0.22);
        }
      }

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

    .blocked-balance {
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      background: rgba(255, 152, 0, 0.08);
      border-left: 4px solid #ff9800;
      transition: all 0.2s ease;

      .q-dark & {
        background: rgba(255, 152, 0, 0.15);
      }

      &:hover {
        background: rgba(255, 152, 0, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(255, 152, 0, 0.2);

        .q-dark & {
          background: rgba(255, 152, 0, 0.22);
        }
      }

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
  }

  .wallet-actions {
    .action-btn {
      border-radius: 10px;
      padding: 12px 0;
      font-weight: 500;
    }
  }
}

// Целевые программы
.programs-card {
  .programs-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .programs-icon {
      margin-right: 12px;
    }

    .programs-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .programs-list {
    .program-item {
      background-color: rgba(0, 0, 0, 0.03);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      .q-dark & {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

        .q-dark & {
          background-color: rgba(255, 255, 255, 0.08);
        }
      }

      .program-name {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
      }

      .program-balances {
        display: flex;
        gap: 24px;

        .balance-item {
          .label {
            font-size: 12px;
            margin-bottom: 4px;
            opacity: 0.6;
          }

          .value {
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
    }
  }

  .empty-programs {
    text-align: center;
    padding: 40px 20px;

    .empty-icon {
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 8px;
      opacity: 0.7;
    }

    .empty-subtitle {
      font-size: 14px;
      opacity: 0.5;
    }
  }
}

// Минимальный остаток
.minimum-balance-card {
  background: rgba(255, 152, 0, 0.05);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;

  .q-dark & {
    background: rgba(255, 152, 0, 0.08);
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  &:hover {
    background: rgba(255, 152, 0, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 152, 0, 0.15);

    .q-dark & {
      background: rgba(255, 152, 0, 0.12);
    }
  }

  .minimum-balance-info {
    display: flex;
    align-items: center;

    .info-icon {
      margin-right: 12px;
    }

    .info-content {
      .info-label {
        font-size: 14px;
        margin-bottom: 2px;
        opacity: 0.7;
      }

      .info-value {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .programs-card .programs-list .program-item .program-balances {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
