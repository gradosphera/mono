<template lang="pug">
.q-pa-md
  PageHead(
    eyebrow='Шасси расходов',
    :title='headerTitle',
    :subtitle='headerSubtitle'
  )
    template(#actions)
      BaseBadge(
        v-if='proposal?.status',
        :variant='proposalStatusVariant(proposal.status)'
      ) {{ proposalStatusLabel(proposal.status) }}

  q-inner-loading(:showing='loading && !proposal', color='primary')

  .expense-detail(v-if='proposal')
    .row.q-col-gutter-md
      .col-12.col-md-8
        BaseCard
          template(#head)
            .card-header
              .t-section Сводка
          .summary-grid
            DataRow(label='Пайщик', :value='proposal.username || "—"')
            DataRow(label='Кооператив', :value='proposal.coopname || "—"')
            DataRow(label='Кошелёк (пул)', :value='walletLabel(proposal.source_wallet)')
            DataRow(label='Сумма (план)', :value='formatAmount(proposal.total_planned)')
            DataRow(label='Сумма (факт)', :value='formatAmount(proposal.total_actual)')
            DataRow(label='Создана', :value='formatDate(proposal.created_at)')
            DataRow(label='Обновлена', :value='formatDate(proposal.updated_at)')
            DataRow(label='Hash')
              template(#value-override)
                span.t-mono-sm {{ proposal.proposal_hash }}

        BaseCard.q-mt-md
          template(#head)
            .card-header
              .t-section Строки расходов
              span.t-muted {{ proposal.items?.length || 0 }} строк
          .table-wrap(v-if='proposal.items?.length')
            .table-scroll
              table.table
                thead
                  tr
                    th Получатель
                    th Способ
                    th.col-num План
                    th.col-num Факт
                    th Статус
                tbody
                  tr(v-for='item in proposal.items', :key='item.item_hash')
                    td.cell-name {{ item.recipient || '—' }}
                    td {{ mechanicsLabel(item.mechanics) }}
                    td.col-num {{ formatAmount(item.planned_amount) }}
                    td.col-num {{ formatAmount(item.actual_amount) }}
                    td
                      BaseBadge(:variant='itemStatusVariant(item.status)') {{ itemStatusLabel(item.status) }}
          EmptyState(
            v-else,
            title='Нет строк',
            body='У этой служебной записки нет позиций.'
          )
            template(#icon)
              q-icon(name='list', size='40px')

      .col-12.col-md-4
        BaseCard
          template(#head)
            .card-header
              .t-section Документы
          //- Канон шасси: служебная записка + протокол решения совета. Клик по
          //- строке раскрывает сам документ (BaseDocument: стили + подписи), а не
          //- голый хеш. Тот же компонент — на странице расхода программы.
          ExpenseProposalDocuments(
            v-if='hasDocuments',
            :statement='proposal.statement_doc',
            :decision='proposal.decision_doc'
          )
          EmptyState(
            v-else,
            title='Документы не сформированы',
            body='Здесь появятся служебная записка и протокол решения совета.'
          )
            template(#icon)
              q-icon(name='description', size='40px')

        BaseCard.q-mt-md
          template(#head)
            .card-header
              .t-section Чеки и подтверждения
              span.t-muted {{ files.length }}
          .files(v-if='files.length')
            .file-row(v-for='file in files', :key='file.id')
              q-icon(name='attachment', size='20px')
              .file-row__body
                .file-row__name {{ file.storage_key || '—' }}
                .file-row__meta.t-muted
                  span(v-if='file.uploaded_by_username') {{ file.uploaded_by_username }}
                  span(v-if='file.uploaded_at') {{ ' · ' + formatDate(String(file.uploaded_at)) }}
                  span(v-if='file.size_bytes') {{ ' · ' + formatBytes(Number(file.size_bytes)) }}
          EmptyState(
            v-else,
            title='Файлов пока нет',
            body='Прикреплённые чеки появятся после подачи отчёта.'
          )
            template(#icon)
              q-icon(name='upload_file', size='40px')

  EmptyState(
    v-else-if='!loading && loaded',
    title='Расход не найден',
    body='Возможно, ссылка устарела или у вас нет доступа.'
  )
    template(#icon)
      q-icon(name='error_outline', size='48px')
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { PageHead } from 'src/shared/ui/layout';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import { BaseCard } from 'src/shared/ui/base/BaseCard';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { DataRow } from 'src/shared/ui/domain';
import { ExpenseProposalDocuments } from 'src/shared/ui/domain/ExpenseProposalDocuments';
import { FailAlert } from 'src/shared/api';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { listExpenseWallets } from 'src/shared/lib/expense-wallets';
import {
  getExpenseProposal,
  getExpenseFilesByProposal,
  type IExpenseProposalResult,
  type IExpenseFilesByProposalResult,
} from '../api';
import {
  getExpenseProposalStatusLabel,
  getExpenseProposalStatusVariant,
  getExpenseItemStatusLabel,
  getExpenseItemStatusVariant,
  getExpenseMechanicsLabel,
} from '../model';

type IProposal = NonNullable<IExpenseProposalResult>;
type IFileRow = IExpenseFilesByProposalResult[number];

const route = useRoute();

const loading = ref(false);
const loaded = ref(false);
const proposal = ref<IProposal | null>(null);
const files = ref<IFileRow[]>([]);

const headerTitle = computed(() => {
  if (!proposal.value) return 'Служебная записка';
  return `Служебная записка ${truncateHash(proposal.value.proposal_hash)}`;
});

const headerSubtitle = computed(() => {
  if (!proposal.value) return 'Цепочка артефактов: заявление → решение совета → чеки';
  return `Создана ${formatDate(proposal.value.created_at)} · ${proposal.value.username || '—'}`;
});

function proposalStatusLabel(status?: Zeus.ExpenseProposalStatus | null): string {
  return getExpenseProposalStatusLabel(status);
}

function proposalStatusVariant(status?: Zeus.ExpenseProposalStatus | null) {
  return getExpenseProposalStatusVariant(status);
}

function itemStatusLabel(status?: Zeus.ExpenseItemStatus | null): string {
  return getExpenseItemStatusLabel(status);
}

function itemStatusVariant(status?: Zeus.ExpenseItemStatus | null) {
  return getExpenseItemStatusVariant(status);
}

function mechanicsLabel(mechanics?: Zeus.ExpenseMechanics | null): string {
  return getExpenseMechanicsLabel(mechanics);
}

// Код кошелька-пула → человеческое имя из реестра пулов (fallback — сам код).
const walletTitles = new Map(listExpenseWallets().map((e) => [e.wallet, e.title]));
function walletLabel(code?: string | null): string {
  if (!code) return '—';
  return walletTitles.get(code) ?? code;
}

function formatAmount(asset?: string | null): string {
  if (!asset) return '—';
  return formatAsset2Digits(asset);
}

// Документы показываем каноном, только если пришёл их html (rawDocument) —
// иначе EmptyState «не сформированы».
const hasDocuments = computed(() =>
  Boolean(proposal.value?.statement_doc?.rawDocument?.html)
  || Boolean(proposal.value?.decision_doc?.rawDocument?.html),
);

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}

function truncateHash(hash?: string | null): string {
  if (!hash) return '';
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function load(): Promise<void> {
  const proposalHash = route.params.hash as string;
  const coopname = route.params.coopname as string;
  if (!proposalHash) return;
  try {
    loading.value = true;
    const proposalResult = await getExpenseProposal({ proposal_hash: proposalHash });
    proposal.value = proposalResult as IProposal | null;

    if (coopname && proposal.value) {
      try {
        const filesResult = await getExpenseFilesByProposal({
          coopname,
          proposal_hash: proposalHash,
        });
        files.value = filesResult ?? [];
      } catch (e) {
        FailAlert(e);
      }
    }
  } catch (e) {
    FailAlert(e);
  } finally {
    loading.value = false;
    loaded.value = true;
  }
}

onMounted(() => {
  void load();
});
</script>

<style lang="scss" scoped>
.expense-detail {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-3);
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.table-scroll {
  overflow-x: auto;
}

.table {
  table-layout: fixed;
  min-width: 560px;
}

.col-num {
  width: 110px;
  white-space: nowrap;
  text-align: right;
}

.cell-name {
  overflow-wrap: anywhere;
}

.files {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.file-row {
  display: flex;
  align-items: flex-start;
  gap: var(--p-3);
  padding: var(--p-2) 0;
  border-bottom: 1px solid var(--p-line);
}

.file-row:last-child {
  border-bottom: none;
}

.file-row__body {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
  min-width: 0;
  flex: 1;
}

.file-row__name {
  font-weight: 500;
  overflow-wrap: anywhere;
}

.file-row__meta {
  font-size: var(--p-fs-body-sm);
}
</style>
