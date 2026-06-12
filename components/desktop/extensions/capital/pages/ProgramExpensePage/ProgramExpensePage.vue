<template lang="pug">
q-page.program-expense-page
  template(v-if='loading && !expense')
    .skel
      q-skeleton(type='rect', height='96px')
      q-skeleton(type='rect', height='180px')
      q-skeleton(type='rect', height='180px')

  template(v-else-if='expense')
    //- Статус + сумма — верхняя строка страницы (канон: статус сущности вверху).
    .head-row
      BaseChip(:variant='proposalStatusVariant(expense.status)') {{ proposalStatusLabel(expense.status) }}
      .head-row__amount.t-mono {{ expense.total_planned }}

    BaseCard
      .summary
        DataRow(label='№ служебной записки', :value='shortExpenseId(expense.expense_hash)', mono, copyable)
        DataRow(label='Инициатор', :value='expense.creator_name')
        DataRow(label='Создан', :value='formatDate(expense.created_at)')
        DataRow(label='Сумма по смете', :value='expense.total_planned')
        DataRow(
          v-if='hasActual',
          label='Фактически израсходовано',
          :value='expense.total_actual'
        )

    .section
      .t-eyebrow.t-muted Позиции расхода
      .items
        BaseCard(v-for='(item, idx) in itemRows', :key='item.item_hash')
          .item
            .item__head
              .item__title Позиция №{{ idx + 1 }} — {{ item.description }}
              BaseChip(:variant='itemStatusVariant(item.status)') {{ itemStatusLabel(item.status, item.mechanics) }}
            .item__rows
              DataRow(label='Получатель', :value='item.recipient_name')
              DataRow(label='Способ оплаты', :value='mechanicsLabel(item.mechanics)')
              DataRow(label='Сумма (план)', :value='item.planned_amount')
              DataRow(v-if='itemHasActual(item)', label='Фактически', :value='item.actual_amount')
              DataRow(
                v-if='item.requisite',
                label='Реквизиты получателя',
                :value='item.requisite.requisites'
              )
              DataRow(
                v-if='item.requisite?.payment_purpose',
                label='Назначение платежа',
                :value='item.requisite.payment_purpose'
              )
            .item__files(v-if='item.files.length')
              .t-sm.t-muted Первичные документы
              button.file-link(
                v-for='file in item.files',
                :key='file.id',
                type='button',
                :disabled='openingId === file.id',
                @click='openFile(file)'
              )
                q-icon(name='attach_file', size='16px')
                span {{ fileKindLabel(file.kind) }}: {{ fileLabel(file) }}
                q-spinner(v-if='openingId === file.id', size='14px')

    .section
      .t-eyebrow.t-muted История состояний
      BaseCard
        ActivityTimeline(:events='timeline', group-by-date)

  .empty(v-else)
    EmptyState(
      title='Расход не найден',
      body='Служебная записка с таким номером отсутствует или ещё не синхронизирована.'
    )
      template(#icon)
        q-icon(name='receipt_long', size='48px')
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { FailAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import { useDesktopStore } from 'src/entities/Desktop';
import { BaseCard } from 'src/shared/ui/base/BaseCard';
import { BaseChip } from 'src/shared/ui/base/BaseChip';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { DataRow } from 'src/shared/ui/domain/DataRow';
import { ActivityTimeline } from 'src/shared/ui/domain/ActivityTimeline';
import type { ActivityEvent } from 'src/shared/ui/domain/ActivityTimeline';
import { api } from 'app/extensions/capital/entities/ProgramExpense/api';
import {
  useProgramExpenseStore,
  proposalStatusLabel,
  proposalStatusVariant,
  itemStatusLabel,
  itemStatusVariant,
  mechanicsLabel,
  fileKindLabel,
  shortExpenseId,
  type IExpenseProposalAggregate,
  type IExpenseProposalFile,
  type IExpenseRequisite,
  type IProgramExpenseItem,
} from 'app/extensions/capital/entities/ProgramExpense/model';

const route = useRoute();
const system = useSystemStore();
const desktopStore = useDesktopStore();
const store = useProgramExpenseStore();

const expenseHash = computed(() => String(route.params.expense_hash ?? ''));
const expense = computed(() => store.programExpense);

const proposal = ref<IExpenseProposalAggregate | null>(null);
const files = ref<IExpenseProposalFile[]>([]);
const requisites = ref<IExpenseRequisite[]>([]);
const loading = ref(false);

async function refresh(): Promise<void> {
  try {
    loading.value = true;
    const coopname = system.info.coopname;
    const hash = expenseHash.value;
    // Реквизиты и файлы — вспомогательные: их отказ не должен прятать смету.
    const [, proposalResult, filesResult, requisitesResult] = await Promise.allSettled([
      store.loadProgramExpense({ coopname, expense_hash: hash }),
      api.loadExpenseProposal(hash),
      api.loadExpenseFiles(coopname, hash),
      api.loadExpenseRequisites(coopname, hash),
    ]);
    proposal.value = proposalResult.status === 'fulfilled' ? proposalResult.value : null;
    files.value = filesResult.status === 'fulfilled' ? filesResult.value : [];
    requisites.value = requisitesResult.status === 'fulfilled' ? requisitesResult.value : [];
  } catch (e) {
    FailAlert(e);
  } finally {
    loading.value = false;
  }
}

onMounted(refresh);

// Номер СЗ — в заголовок шапки на время просмотра страницы.
watch(
  expense,
  (value) => {
    if (value) desktopStore.setPageTitleOverride(`Расход № ${shortExpenseId(value.expense_hash)}`);
  },
  { immediate: true },
);
onUnmounted(() => desktopStore.clearPageTitleOverride());

const hasActual = computed(
  () => parseFloat(expense.value?.total_actual ?? '0') > 0,
);

type ItemRow = IProgramExpenseItem & {
  requisite: IExpenseRequisite | null;
  files: IExpenseProposalFile[];
};

const itemRows = computed<ItemRow[]>(() => {
  const items = expense.value?.items ?? [];
  return items.map((item) => ({
    ...item,
    requisite:
      requisites.value.find((r) => r.item_hash === item.item_hash) ?? null,
    files: files.value.filter((f) => f.item_hash === item.item_hash),
  }));
});

function itemHasActual(item: IProgramExpenseItem): boolean {
  return parseFloat(item.actual_amount ?? '0') > 0;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU');
  } catch {
    return iso;
  }
}

function fileLabel(file: IExpenseProposalFile): string {
  if (file.original_filename) return file.original_filename;
  const date = file.uploaded_at
    ? new Date(file.uploaded_at).toLocaleString('ru-RU')
    : '';
  return `документ от ${date}`;
}

// Списочные запросы файлов отдают записи без read_url (он короткоживущий) —
// свежая ссылка запрашивается по id в момент клика.
const openingId = ref<number | null>(null);
async function openFile(file: IExpenseProposalFile): Promise<void> {
  try {
    openingId.value = file.id;
    const url = await api.getExpenseFileReadUrl(file.id);
    if (!url) throw new Error('Не удалось получить ссылку на файл');
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    FailAlert(e);
  } finally {
    openingId.value = null;
  }
}

// История состояний собирается из фактов, которые уже есть в данных:
// дат СЗ, подписей документов (заявление/решение) и загруженных первичных
// документов. Отдельной журнальной таблицы у шасси нет — финальные статусы
// контракт хранит в рабочем состоянии, история действий живёт в парсере.
function firstSignatureDate(
  doc: NonNullable<IExpenseProposalAggregate>['statement_doc'] | null | undefined,
): string | null {
  const signatures = doc?.document?.signatures;
  if (!signatures?.length) return null;
  return signatures[0]?.signed_at ?? null;
}

const timeline = computed<ActivityEvent[]>(() => {
  const e = expense.value;
  if (!e) return [];
  const events: ActivityEvent[] = [
    {
      id: 'created',
      type: 'create',
      title: 'Служебная записка создана',
      actor: e.creator_name,
      date: e.created_at,
    },
  ];

  const statementSigned = firstSignatureDate(proposal.value?.statement_doc);
  if (statementSigned) {
    events.push({
      id: 'statement',
      type: 'sign',
      title: 'Заявление на расход подписано',
      actor: e.creator_name,
      date: statementSigned,
    });
  }

  const decisionSigned = firstSignatureDate(proposal.value?.decision_doc);
  if (decisionSigned || e.status === Zeus.ExpenseProposalStatus.DECLINED) {
    const declined = e.status === Zeus.ExpenseProposalStatus.DECLINED;
    events.push({
      id: 'decision',
      type: declined ? 'reject' : 'sign',
      title: declined
        ? 'Совет отклонил расход'
        : 'Совет утвердил расход — протокол решения подписан',
      date: decisionSigned ?? e.updated_at,
    });
  }

  files.value.forEach((f) => {
    events.push({
      id: `file-${f.id}`,
      type: 'update',
      title: `${fileKindLabel(f.kind)}: приложен документ`,
      description: fileLabel(f),
      date: f.uploaded_at,
    });
  });

  if (e.status === Zeus.ExpenseProposalStatus.REPORT_SUBMITTED) {
    events.push({
      id: 'report',
      type: 'system',
      title: 'Отчёт по смете подан — ожидает закрытия расхода',
      date: e.updated_at,
    });
  }
  if (e.status === Zeus.ExpenseProposalStatus.CLOSED) {
    events.push({
      id: 'closed',
      type: 'system',
      title: 'Расход закрыт — фактическая сумма капитализирована',
      date: e.updated_at,
    });
  }

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});
</script>

<style lang="scss" scoped>
.program-expense-page {
  padding: var(--p-6, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--p-4);
}

@media (max-width: 768px) {
  .program-expense-page {
    padding: var(--p-4, 16px);
  }
}

.skel {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-3);
}

.head-row__amount {
  font-size: var(--p-fs-h3);
  font-weight: 700;
  color: var(--p-ink);
}

.summary {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--p-2);
}

.items {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.item {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--p-2);
}

.item__title {
  font-size: var(--p-fs-body);
  font-weight: 600;
  color: var(--p-ink);
}

.item__rows {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.item__files {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
  padding-top: var(--p-2);
  border-top: 1px solid var(--p-line);
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
  cursor: pointer;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}

.empty {
  margin-top: var(--p-6);
}
</style>
