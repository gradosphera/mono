<template lang="pug">
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
</template>

<script lang="ts" setup>
import { useWalletStore } from 'src/entities/Wallet';
import { computed } from 'vue';

const walletStore = useWalletStore();

// Остальные программы (кроме первой - цифрового кошелька)
const otherPrograms = computed(() => {
  return walletStore.program_wallets.slice(1);
});
</script>

<style lang="scss" scoped>
// Основные карточки
.programs-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .q-dark & {
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

// Адаптивность
@media (max-width: 768px) {
  .programs-card .programs-list .program-item .program-balances {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
