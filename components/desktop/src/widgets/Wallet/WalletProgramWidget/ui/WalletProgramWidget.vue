<template lang="pug">
q-card.programs-card.q-pa-lg(flat)
  .programs-header
    .programs-icon
      q-icon(name='savings', size='24px', color='teal')
    .programs-title Кошельки приложений

  .programs-list(v-if='otherPrograms.length > 0')
    ColorCard(
      v-for='(program, index) in otherPrograms',
      :key='program.id',
      :color='getProgramColor(index)',
      class='program-card'
    )
      .program-name {{ program?.program_details?.title }}
      .program-balances
        .balance-item
          .label Доступно
          .value {{ getFormattedAvailable(program) }}
        .balance-item(
          v-if='program?.blocked && program?.blocked !== "0"'
        )
          .label Заблокировано
          .value {{ getFormattedBlocked(program) }}

  .empty-programs(v-else)
    .empty-icon
      q-icon(name='inbox', size='48px', color='grey-5')
    .empty-text У вас пока нет кошельков приложений. Они будут созданы автоматически в процессе участия.
</template>

<script lang="ts" setup>
import { useWalletStore } from 'src/entities/Wallet';
import { useSystemStore } from 'src/entities/System/model';
import { ColorCard } from 'src/shared/ui';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { computed } from 'vue';

const walletStore = useWalletStore();
const { info } = useSystemStore();

// Остальные программы (кроме первой - цифрового кошелька)
const otherPrograms = computed(() => {
  return walletStore.program_wallets.slice(1);
});

// Цвета для программ
const programColors: ('green' | 'blue' | 'orange' | 'red' | 'purple' | 'teal' | 'grey' | 'indigo' | 'cyan' | 'pink')[] = [
  'green', 'blue', 'purple', 'orange', 'red', 'indigo', 'cyan', 'pink'
];

// Получить цвет для программы по индексу
const getProgramColor = (index: number): 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'teal' | 'grey' | 'indigo' | 'cyan' | 'pink' => {
  return programColors[index % programColors.length];
};

// Форматированная сумма доступных средств для программы
const getFormattedAvailable = (program: any) => {
  const available = program?.available || '0';
  return formatAsset2Digits(`${available} ${info.symbols.root_govern_symbol}`);
};

// Форматированная сумма заблокированных средств для программы
const getFormattedBlocked = (program: any) => {
  const blocked = program?.blocked || '0';
  return formatAsset2Digits(`${blocked} ${info.symbols.root_govern_symbol}`);
};
</script>

<style lang="scss" scoped>
// Основные карточки

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
    .program-card {
      // Переопределяем padding ColorCard
      :deep(.color-card) {
        padding: 16px;
        margin-bottom: 12px;
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
  .programs-card .programs-list .program-card .program-balances {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
