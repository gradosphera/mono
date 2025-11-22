<template lang="pug">
div.axon-wallet-card
  .widget-header
    .widget-icon
      i.fas.fa-wallet
    .widget-title Кошелек AXON

  .wallet-balance
    .balance-value {{ formattedBalance }}
    .balance-label Доступно

  .axon-details
    .detail-row
      .detail-label Минимальных квот:
      .detail-value {{ minQuotasDays }} {{ minQuotasDaysText }}
    .detail-row
      .detail-label Новых пайщиков:
      .detail-value {{ maxNewMembers }} {{ maxNewMembersText }}

  ColorCard(color='purple')
    | AXON используется для аренды вычислительных ресурсов (минимум 5 AXON/день) и регистрации пайщиков (1 AXON/аккаунт). Курс: 1 AXON = 10 RUB.

  q-btn.wallet-btn(
    flat
    no-caps
    size="md"
    color="primary"
    icon="open_in_new"
    label="Пополнить у оператора"
    @click="goToReplenishment"
  )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { pluralizeDays, pluralizeAccounts } from 'src/shared/lib/utils';
import { ColorCard } from 'src/shared/ui';

const systemStore = useSystemStore();

// Баланс AXON в числовом формате
const axonBalance = computed(() => {
  const balance = systemStore.info.blockchain_account?.core_liquid_balance || '0';
  return parseFloat(balance.replace(/[^\d.-]/g, '')) || 0;
});

// Форматированный баланс AXON
const formattedBalance = computed(() => {
  const balance = systemStore.info.blockchain_account?.core_liquid_balance || '0';
  return formatAsset2Digits(`${balance} AXON`);
});

// Минимальных квот в днях
const minQuotasDays = computed(() => {
  return Math.floor(axonBalance.value / 5);
});

// Максимум новых пайщиков
const maxNewMembers = computed(() => {
  return Math.floor(axonBalance.value);
});

// Текст для дней с правильным склонением
const minQuotasDaysText = computed(() => {
  return pluralizeDays(minQuotasDays.value);
});

// Текст для аккаунтов с правильным склонением
const maxNewMembersText = computed(() => {
  return pluralizeAccounts(maxNewMembers.value);
});

// Переход на сайт пополнения
const goToReplenishment = () => {
  window.open('https://лк.цифровой-кооператив.рф', '_blank');
};
</script>

<style lang="scss" scoped>
.axon-wallet-card {
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  height: 100%;
  min-width: 320px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

.widget-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;

  .widget-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;

    i {
      color: white;
      font-size: 1.2rem;
    }
  }

  .widget-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
}

.wallet-balance {
  text-align: center;
  margin-bottom: 1rem;

  .balance-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }

  .balance-label {
    font-size: 0.8rem;
    opacity: 0.7;
  }
}

.axon-details {
  margin-bottom: 1rem;

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f3f4;

    &:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.85rem;
      font-weight: 600;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    }
  }
}

.wallet-btn {
  margin-top: 1rem;
  width: 100%;
}
</style>
