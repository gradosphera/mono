<template lang="pug">
.q-pa-md
  PageHead(
    eyebrow='Шасси расходов',
    title='Реестр расходов',
    subtitle='Общий список служебных записок по расходам кооператива'
  )

  .expenses-registry
    TableSkeleton(
      v-if='loading && !items.length',
      :columns='skeletonColumns',
      :rows='6',
      min-width='880px'
    )

    .table-wrap(v-else-if='items.length')
      .table-scroll
        table.table
          thead
            tr
              th Пайщик
              th.col-date Дата создания
              th.col-num Сумма (план)
              th.col-num Сумма (факт)
              th Статус
              th Хеш
          tbody
            tr.data-row(
              v-for='row in items',
              :key='row.proposal_hash',
              @click='openDetail(row.proposal_hash)'
            )
              td.cell-name {{ row.username || '—' }}
              td {{ formatCreatedAt(row.created_at) }}
              td.col-num {{ row.total_planned || '—' }}
              td.col-num {{ row.total_actual || '—' }}
              td
                BaseBadge(:variant='statusVariant(row.status)') {{ statusLabel(row.status) }}
              td.col-hash.t-mono-sm {{ truncateHash(row.proposal_hash) }}

      .table-foot
        span {{ rangeLabel }}
        BaseButton(
          v-if='hasMore',
          variant='ghost',
          size='sm',
          :loading='loading',
          @click='loadMore'
        ) Загрузить ещё

    EmptyState(
      v-else,
      title='Расходов пока нет',
      body='Здесь появятся служебные записки по расходам кооператива.'
    )
      template(#icon)
        q-icon(name='receipt_long', size='48px')
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { PageHead } from 'src/shared/ui/layout';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { TableSkeleton } from 'src/shared/ui/base/TableSkeleton';
import type { TableSkeletonColumn } from 'src/shared/ui/base/TableSkeleton';
import { FailAlert } from 'src/shared/api';
import {
  getExpenseProposalsByCooperative,
  type IExpenseProposalsByCooperativeResult,
} from '../api';
import {
  getExpenseProposalStatusLabel,
  getExpenseProposalStatusVariant,
} from '../model';

type IProposalRow = NonNullable<IExpenseProposalsByCooperativeResult['items']>[number];

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const items = ref<IProposalRow[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);

const PAGE_LIMIT = 25;

const skeletonColumns = computed<TableSkeletonColumn[]>(() => [
  { label: 'Пайщик', cell: 'text' },
  { label: 'Дата создания', cell: 'text', cellWidth: '120px' },
  { label: 'Сумма (план)', class: 'col-num', cell: 'text', cellWidth: '110px' },
  { label: 'Сумма (факт)', class: 'col-num', cell: 'text', cellWidth: '110px' },
  { label: 'Статус', cell: 'badge' },
  { label: 'Хеш', cell: 'text', cellWidth: '140px' },
]);

const hasMore = computed(() => currentPage.value < totalPages.value);

const rangeLabel = computed(() => {
  const shown = items.value.length;
  return shown ? `1–${shown} из ${totalCount.value}` : `0 из ${totalCount.value}`;
});

function statusLabel(status?: Zeus.ExpenseProposalStatus | null): string {
  return getExpenseProposalStatusLabel(status);
}

function statusVariant(status?: Zeus.ExpenseProposalStatus | null) {
  return getExpenseProposalStatusVariant(status);
}

function formatCreatedAt(createdAt?: string | null): string {
  if (!createdAt) return '—';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}

function truncateHash(hash: string): string {
  if (!hash) return '';
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

async function loadPage(page = 1): Promise<void> {
  const coopname = route.params.coopname as string;
  if (!coopname) return;
  try {
    loading.value = true;
    const result = await getExpenseProposalsByCooperative({
      coopname,
      options: {
        page,
        limit: PAGE_LIMIT,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      },
    });
    const incoming = (result.items ?? []) as IProposalRow[];
    items.value = page === 1 ? incoming : [...items.value, ...incoming];
    currentPage.value = result.currentPage ?? page;
    totalPages.value = result.totalPages ?? 1;
    totalCount.value = result.totalCount ?? items.value.length;
  } catch (e) {
    FailAlert(e);
  } finally {
    loading.value = false;
  }
}

function loadMore(): void {
  if (loading.value || !hasMore.value) return;
  void loadPage(currentPage.value + 1);
}

function openDetail(hash: string): void {
  void router.push({ name: 'expenses-detail', params: { hash } });
}

onMounted(() => {
  void loadPage(1);
});
</script>

<style lang="scss" scoped>
.expenses-registry {
  width: 100%;
}

.table-scroll {
  overflow-x: auto;
}

.table {
  table-layout: fixed;
  min-width: 880px;
}

.col-date {
  width: 132px;
  white-space: nowrap;
}

.col-num {
  width: 120px;
  white-space: nowrap;
  text-align: right;
}

.col-hash {
  width: 160px;
  color: var(--p-ink-2);
}

.cell-name {
  overflow-wrap: anywhere;
}

.data-row {
  cursor: pointer;
}
</style>
