<template lang="pug">
q-page.program-expenses-page
  .header
    .header__left
      h1.t-h2 Управление расходами программы
      .t-body-sm.muted Программные расходы Капитала через шасси расходов.
    .header__actions
      BaseButton(
        variant='ghost',
        icon='account_balance_wallet',
        @click='openTopup'
      ) Пополнить пул
      BaseButton(
        variant='primary',
        icon='add',
        @click='openCreate'
      ) Создать расход

  .content(v-if='store.programExpenses && store.programExpenses.items.length')
    .row.q-col-gutter-md
      .col-12.col-md-6.col-lg-4(v-for='item in store.programExpenses.items', :key='item.expense_hash')
        BaseCard
          .row-card
            .row-card__head
              .row-card__title {{ item.description || '— без описания —' }}
              BaseChip(:label='statusLabel(item.status)', :tone='statusTone(item.status)')
            .row-card__amount {{ item.total_planned }}
            .row-card__meta
              .meta-row
                .meta-key Инициатор
                .meta-val {{ item.creator }}
              .meta-row
                .meta-key Операция
                .meta-val {{ item.operation_code }}
              .meta-row
                .meta-key Создан
                .meta-val {{ formatDate(item.created_at) }}
            .row-card__hash {{ shortHash(item.expense_hash) }}

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
import { useSystemStore } from 'src/entities/System/model';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { BaseCard } from 'src/shared/ui/base/BaseCard';
import { BaseChip } from 'src/shared/ui/base/BaseChip';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { useProgramExpenseStore } from 'app/extensions/capital/entities/ProgramExpense/model';
import { CreateProgramExpenseDialog } from 'app/extensions/capital/features/ProgramExpense/CreateProgramExpense/ui';
import { TopupProgramExpensePoolDialog } from 'app/extensions/capital/features/ProgramExpense/TopupPool/ui';

const system = useSystemStore();
const store = useProgramExpenseStore();

const coopname = computed(() => system.info.coopname);
const createOpen = ref(false);
const topupOpen = ref(false);

function openCreate(): void { createOpen.value = true; }
function openTopup(): void { topupOpen.value = true; }

async function refresh(): Promise<void> {
  await store.loadProgramExpenses({ coopname: coopname.value });
}

onMounted(refresh);

function shortHash(h: string): string {
  return h.length > 12 ? `${h.slice(0, 8)}…${h.slice(-4)}` : h;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU');
  } catch {
    return iso;
  }
}

type ProgramExpenseStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'PARTIALLY_PAID'
  | 'REPORT_SUBMITTED'
  | 'CLOSED'
  | 'DECLINED'
  | 'UNDEFINED';

function statusLabel(status: ProgramExpenseStatus): string {
  const map: Record<ProgramExpenseStatus, string> = {
    CREATED: 'Создан',
    AUTHORIZED: 'Авторизован',
    PARTIALLY_PAID: 'Частично оплачен',
    REPORT_SUBMITTED: 'Отчёт подан',
    CLOSED: 'Закрыт',
    DECLINED: 'Отклонён',
    UNDEFINED: 'Неизвестно',
  };
  return map[status] ?? status;
}

function statusTone(status: ProgramExpenseStatus): 'neutral' | 'positive' | 'warning' | 'danger' {
  switch (status) {
    case 'CLOSED':
      return 'positive';
    case 'AUTHORIZED':
    case 'PARTIALLY_PAID':
    case 'REPORT_SUBMITTED':
      return 'warning';
    case 'DECLINED':
      return 'danger';
    default:
      return 'neutral';
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

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--p-4);
  margin-bottom: var(--p-5);
  flex-wrap: wrap;
}

.header__left {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.header__actions {
  display: flex;
  gap: var(--p-2);
}

.muted {
  color: var(--p-muted);
}

.row-card {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
  padding: var(--p-4);
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
  color: var(--p-text);
}

.row-card__amount {
  font-size: var(--p-fs-h3);
  font-weight: 700;
  color: var(--p-text);
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
  color: var(--p-muted);
}

.meta-val {
  color: var(--p-text);
}

.row-card__hash {
  font-family: var(--p-font-mono, monospace);
  font-size: var(--p-fs-body-xs);
  color: var(--p-muted);
}

.empty {
  margin-top: var(--p-6);
}
</style>
