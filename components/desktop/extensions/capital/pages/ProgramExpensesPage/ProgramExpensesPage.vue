<template lang="pug">
q-page.program-expenses-page
  //- Действия страницы — в топбар через canon Teleport в слот-host шапки.
  //- На мобильном — micro-вариант (иконка + tooltip).
  Teleport(to='#header-actions-host', defer)
    q-btn(
      @click='openCreate',
      :color='isMobile ? "accent" : "primary"',
      :flat='isMobile',
      :dense='isMobile',
      :size='isMobile ? "sm" : undefined',
      no-wrap
    )
      q-icon(name='add')
      span.q-ml-sm(v-if='!isMobile') Создать расход
      q-tooltip(v-if='isMobile') Создать расход
    q-btn(
      @click='openTopup',
      color='primary',
      flat,
      :dense='isMobile',
      :size='isMobile ? "sm" : undefined',
      no-wrap
    )
      q-icon(name='account_balance_wallet')
      span.q-ml-sm(v-if='!isMobile') Пополнить пул
      q-tooltip(v-if='isMobile') Пополнить пул

  .pools.row.q-col-gutter-md
    .col-12.col-md-6
      WalletCard(
        neutral,
        title='Инвест-пул',
        subtitle='Источник пополнения',
        balance-label='Доступно к распределению',
        :balance='globalPool.amount',
        :symbol='globalPool.symbol',
        icon='savings',
        :loading='!configStore.state'
      )
    .col-12.col-md-6
      WalletCard(
        program='blagorost',
        title='Пул расходов',
        subtitle='Оплата программных расходов',
        balance-label='Доступно',
        :balance='expensePool.amount',
        :symbol='expensePool.symbol',
        :locked-balance='expenseReserved.has ? expenseReserved.amount : undefined',
        locked-label='Зарезервировано',
        icon='receipt_long',
        :loading='!configStore.state'
      )

  .content(v-if='store.programExpenses && store.programExpenses.items.length')
    .row.q-col-gutter-md
      .col-12.col-md-6.col-lg-4(v-for='item in store.programExpenses.items', :key='item.expense_hash')
        BaseCard.row-card-link(@click='openExpense(item.expense_hash)')
          .row-card
            .row-card__head
              .row-card__title {{ item.items[0]?.description || '— без описания —' }}
              BaseChip(:variant='statusVariant(item.status)') {{ statusLabel(item.status) }}
            .row-card__amount {{ item.total_planned }}
            .row-card__meta
              .meta-row
                .meta-key № служебной записки
                .meta-val.t-mono {{ shortId(item.expense_hash) }}
              .meta-row
                .meta-key Инициатор
                .meta-val {{ item.creator_name || item.creator }}
              .meta-row
                .meta-key Создан
                .meta-val {{ formatDate(item.created_at) }}

  .empty(v-else)
    EmptyState(
      title='Программных расходов пока нет',
      body='Создайте первый расход через кнопку «Создать расход» в шапке.'
    )
      template(#icon)
        q-icon(name='receipt_long', size='48px')

  CreateProgramExpenseDialog(
    v-model='createOpen',
    @created='refresh'
  )
  TopupProgramExpensePoolDialog(
    v-model='topupOpen',
    @topped-up='refresh'
  )
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';
import { useWindowSize } from 'src/shared/hooks';
import { BaseCard } from 'src/shared/ui/base/BaseCard';
import { BaseChip } from 'src/shared/ui/base/BaseChip';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { WalletCard } from 'src/shared/ui/domain/WalletCard';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import {
  useProgramExpenseStore,
  proposalStatusLabel as statusLabel,
  proposalStatusVariant as statusVariant,
  shortExpenseId as shortId,
} from 'app/extensions/capital/entities/ProgramExpense/model';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { CreateProgramExpenseDialog } from 'app/extensions/capital/features/ProgramExpense/CreateProgramExpense/ui';
import { TopupProgramExpensePoolDialog } from 'app/extensions/capital/features/ProgramExpense/TopupPool/ui';

const system = useSystemStore();
const store = useProgramExpenseStore();
const configStore = useConfigStore();
const { isMobile } = useWindowSize();

const coopname = computed(() => system.info.coopname);
const createOpen = ref(false);
const topupOpen = ref(false);

function openCreate(): void { createOpen.value = true; }
function openTopup(): void { topupOpen.value = true; }

function splitAsset(asset?: string | null): { amount: string; symbol: string } {
  const fallbackSymbol = system.info?.symbols?.root_govern_symbol ?? 'RUB';
  if (!asset) return { amount: '0,00', symbol: fallbackSymbol };
  const parts = formatAsset2Digits(asset).split(' ');
  return { amount: parts[0] || '0,00', symbol: parts[1] || fallbackSymbol };
}

const globalPool = computed(() =>
  splitAsset(configStore.state?.global_available_invest_pool),
);
const expensePool = computed(() =>
  splitAsset(configStore.state?.program_expense_pool),
);
const expenseReserved = computed(() => {
  const reserved = configStore.state?.program_expense_reserved;
  return { ...splitAsset(reserved), has: parseFloat(reserved ?? '0') > 0 };
});

async function refresh(): Promise<void> {
  await Promise.all([
    store.loadProgramExpenses({ coopname: coopname.value }),
    configStore.loadState({ coopname: coopname.value }),
  ]);
}

onMounted(refresh);

const router = useRouter();
function openExpense(expenseHash: string): void {
  router.push({ name: 'capital-program-expense', params: { expense_hash: expenseHash } });
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU');
  } catch {
    return iso;
  }
}
</script>

<style lang="scss" scoped>
.program-expenses-page {
  padding: var(--p-6, 24px);
}

@media (max-width: 768px) {
  .program-expenses-page {
    padding: var(--p-4, 16px);
  }
}

.pools {
  margin-bottom: var(--p-5);
}

.row-card-link {
  cursor: pointer;
}

.row-card {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.row-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-2);
}

.row-card__title {
  font-size: var(--p-fs-body);
  font-weight: 600;
  color: var(--p-ink);
}

.row-card__amount {
  font-size: var(--p-fs-h3);
  font-weight: 700;
  color: var(--p-ink);
}

.row-card__meta {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: var(--p-3);
  font-size: var(--p-fs-body-sm);
}

.meta-key {
  color: var(--p-ink-2);
}

.meta-val {
  color: var(--p-ink);
}

.empty {
  margin-top: var(--p-6);
}
</style>
