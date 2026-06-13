<template lang="pug">
.q-pa-md
  q-inner-loading(:showing='loading && !proposal', color='primary')

  .expense-detail(v-if='proposal')
    //- Статус расхода — вверху страницы, справа (канон detail-страниц).
    .head-row
      BaseChip(
        v-if='proposal.status',
        :variant='proposalStatusVariant(proposal.status)'
      ) {{ proposalStatusLabel(proposal.status) }}

    .section
      .t-eyebrow.t-muted Сводка
      BaseCard
        .summary
          DataRow(label='Пайщик', :value='creatorName')
          DataRow(label='Аккаунт', :value='proposal.username || "—"', mono, copyable)
          DataRow(label='Кооператив', :value='proposal.coopname || "—"')
          DataRow(label='Кошелёк (пул)', :value='walletLabel(proposal.source_wallet)')
          DataRow(label='Сумма (план)', :value='formatAmount(proposal.total_planned)')
          DataRow(label='Сумма (факт)', :value='formatAmount(proposal.total_actual)')
          DataRow(label='Создана', :value='formatDate(proposal.created_at)')
          DataRow(label='Обновлена', :value='formatDate(proposal.updated_at)')
          DataRow(label='Хеш', :value='proposal.proposal_hash', mono, copyable, align='vertical')

    //- Документы расхода — заявление (СЗ) и протокол решения совета. Клик по
    //- строке раскрывает сам документ во всплывашке (доменный канон шасси).
    .section
      .t-eyebrow.t-muted Документы
      BaseCard
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

    .section
      .t-eyebrow.t-muted Строки расходов
      BaseCard
        .items-head(v-if='itemsCount')
          span.t-muted {{ itemsCountLabel }}
        .table-wrap(v-if='itemsCount')
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

    //- Чеки/подтверждения — кликабельное имя файла открывает документ в новой
    //- вкладке (как на странице расхода программы: read_url короткоживущий,
    //- запрашиваем свежий по id в момент клика).
    .section(v-if='files.length')
      .t-eyebrow.t-muted Чеки и подтверждения
      BaseCard
        .files
          .file-row(v-for='file in files', :key='file.id')
            button.file-link(
              type='button',
              :disabled='openingId === file.id',
              @click='openFile(file)'
            )
              q-icon(name='attach_file', size='16px')
              span {{ fileLabel(file) }}
              q-spinner(v-if='openingId === file.id', size='14px')
            .file-row__meta.t-muted(v-if='uploaderName(file.uploaded_by_username) || file.uploaded_at')
              span(v-if='uploaderName(file.uploaded_by_username)') {{ uploaderName(file.uploaded_by_username) }}
              span(v-if='file.uploaded_at') {{ (uploaderName(file.uploaded_by_username) ? ' · ' : '') + formatDate(String(file.uploaded_at)) }}

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
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import { BaseCard } from 'src/shared/ui/base/BaseCard';
import { BaseChip } from 'src/shared/ui/base/BaseChip';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { DataRow } from 'src/shared/ui/domain';
import { ExpenseProposalDocuments } from 'src/shared/ui/domain/ExpenseProposalDocuments';
import { FailAlert } from 'src/shared/api';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { getNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { listExpenseWallets } from 'src/shared/lib/expense-wallets';
import {
  getExpenseProposal,
  getExpenseFilesByProposal,
  getExpenseFileReadUrl,
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

type ISignature = NonNullable<
  NonNullable<NonNullable<IProposal['statement_doc']>['document']>['signatures']
>[number];

// ФИО пайщика — из сертификата подписанта служебной записки (её подписывает
// создатель). Доп. запрос аккаунта не нужен — сертификат уже в агрегате.
const creatorName = computed(() => {
  const cert = proposal.value?.statement_doc?.document?.signatures?.[0]?.signer_certificate;
  return (cert ? getNameFromCertificate(cert) : '') || proposal.value?.username || '—';
});

// Карта «аккаунт → сертификат» из всех подписей расхода (СЗ + протокол) —
// чтобы показать ФИО того, кто приложил чек, а не имя его аккаунта.
const signerCerts = computed(() => {
  const map = new Map<string, ISignature['signer_certificate']>();
  const collect = (doc: IProposal['statement_doc']): void => {
    (doc?.document?.signatures ?? []).forEach((s) => {
      if (s.signer && s.signer_certificate) map.set(s.signer, s.signer_certificate);
    });
  };
  collect(proposal.value?.statement_doc);
  collect(proposal.value?.decision_doc);
  return map;
});
function uploaderName(username?: string | null): string {
  if (!username) return '';
  const cert = signerCerts.value.get(username);
  return cert ? getNameFromCertificate(cert) : '';
}

// Документы показываем каноном, только если пришёл их html (rawDocument).
const hasDocuments = computed(() =>
  Boolean(proposal.value?.statement_doc?.rawDocument?.html)
  || Boolean(proposal.value?.decision_doc?.rawDocument?.html),
);

const itemsCount = computed(() => proposal.value?.items?.length ?? 0);
const itemsCountLabel = computed(
  () => `${itemsCount.value} ${pluralRu(itemsCount.value, 'строка', 'строки', 'строк')}`,
);

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}

function fileLabel(file: IFileRow): string {
  if (file.original_filename) return file.original_filename;
  const date = file.uploaded_at ? new Date(file.uploaded_at).toLocaleString('ru-RU') : '';
  return `документ от ${date}`;
}

// Списочные запросы файлов отдают короткоживущий read_url — свежую ссылку
// запрашиваем по id в момент клика, открываем в новой вкладке.
const openingId = ref<number | null>(null);
async function openFile(file: IFileRow): Promise<void> {
  try {
    openingId.value = file.id;
    const url = await getExpenseFileReadUrl(file.id);
    if (!url) throw new Error('Не удалось получить ссылку на файл');
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    FailAlert(e);
  } finally {
    openingId.value = null;
  }
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
  display: flex;
  flex-direction: column;
  gap: var(--p-4);
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--p-3);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--p-2);
}

.summary {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.items-head {
  margin-bottom: var(--p-2);
  font-size: var(--p-fs-body-sm);
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
  flex-direction: column;
  gap: 2px;
  padding: var(--p-2) 0;
  border-bottom: 1px solid var(--p-line);
}

.file-row:last-child {
  border-bottom: none;
}

.file-row__meta {
  font-size: var(--p-fs-body-sm);
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: var(--p-1);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--p-primary);
  font-size: var(--p-fs-body-sm);
  text-align: left;
  cursor: pointer;
  overflow-wrap: anywhere;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}
</style>
