<template lang="pug">
.payments-table
  TableSkeleton(
    v-if='onLoading && !items.length',
    :columns='skeletonColumns',
    :rows='6',
    :min-width='hideActions ? "880px" : "1000px"'
  )
  template(v-else-if='items.length')
    //- Десктоп: канон-таблица. На мобиле скрыта — таблица из 7–8 колонок
    //- нечитаема на телефоне (глобальный канон ломает её посимвольным
    //- переносом), поэтому ниже идёт карточная раскладка.
    .table-wrap.pmt-desktop
      .table-scroll
        table.table(:class='{ "table--actions": !hideActions }')
          thead
            tr
              th.col-toggle
              th.col-sort(@click='onSort("username")') Пайщик {{ sortMark('username') }}
              th.col-sort.col-date(@click='onSort("created_at")') Дата создания {{ sortMark('created_at') }}
              th.col-sort.col-num(@click='onSort("quantity")') Сумма {{ sortMark('quantity') }}
              th Тип платежа
              th Направление
              th.col-sort(@click='onSort("status")') Статус {{ sortMark('status') }}
              th.col-action(v-if='!hideActions') Действия
          tbody
            template(v-for='row in items', :key='row.id')
              tr.data-row(@click='toggleExpand(row.id)')
                td.col-toggle
                  button.icon-btn(
                    type='button',
                    :aria-label='expanded.get(row.id) ? "Свернуть" : "Развернуть"',
                    @click.stop='toggleExpand(row.id)'
                  )
                    q-icon(:name='expanded.get(row.id) ? "expand_more" : "chevron_right"')
                td.cell-name {{ getShortNameFromCertificate(row.username_certificate) || row.username }}
                td {{ formatDateToHumanDateTime(row.created_at) }}
                td.col-num {{ row.quantity }} {{ row.symbol }}
                td {{ row.type_label }}
                td
                  span.dir(:class='isIncoming(row.direction) ? "dir--in" : "dir--out"')
                    q-icon.q-mr-xs(:name='getDirectionIcon(row.direction)', size='16px')
                    span {{ row.direction_label }}
                td
                  .cell-status
                    BaseBadge(:variant='getStatusVariant(row.status)') {{ row.status_label }}
                    //- Оплата расхода: отметка о приложенной платёжке (статус не трогаем —
                    //- им управляет реестр; отчитанность видна отдельным значком).
                    q-icon.proof-icon.proof-icon--ok(v-if='proofState(row) === "attached"', name='receipt_long', size='16px')
                      q-tooltip Платёжка приложена
                    q-icon.proof-icon.proof-icon--missing(v-else-if='proofState(row) === "missing"', name='receipt_long', size='16px')
                      q-tooltip Платёжка не приложена
                td.col-action(v-if='!hideActions', @click.stop)
                  .cell-actions(v-if='["EXPIRED", "PENDING", "FAILED"].includes(row.status)')
                    SetOrderPaidStatusButton(:id='row.id')
                    //- Возврат вступительного взноса отклонить нельзя — совет уже
                    //- отказал, кассир обязан вернуть деньги. Прячем «Отклонить».
                    SetOrderRefundedStatusButton(v-if='!isRefundType(row.type)', :id='row.id')
                  span.no-actions(v-else) —

              tr.expand-row(v-if='expanded.get(row.id)')
                td(:colspan='hideActions ? 7 : 8')
                  PaymentDetails(:payment='row')
                  //- Оплата расхода по счёту: кассир прикладывает платёжку/квитанцию
                  //- прямо в реестре после подтверждения оплаты.
                  AttachExpenseProofPanel.q-mt-sm(
                    v-if='expenseProofRef(row)',
                    :proposal-hash='expenseProofRef(row)?.proposal_hash ?? ""',
                    :item-hash='expenseProofRef(row)?.item_hash ?? ""',
                    @uploaded='onProofUploaded(row)'
                  )

      .table-foot
        span {{ rangeLabel }}
        BaseButton(
          v-if='hasMore',
          variant='ghost',
          size='sm',
          :loading='onLoading',
          @click='loadMore'
        ) Загрузить ещё

    //- Мобайл: карточки вместо таблицы. Видны только на узких экранах.
    .payments-cards.pmt-mobile
      .pay-card(v-for='row in items', :key='row.id')
        .pay-card__main(@click='toggleExpand(row.id)')
          .pay-card__row
            span.pay-card__name {{ getShortNameFromCertificate(row.username_certificate) || row.username }}
            .cell-status
              BaseBadge(:variant='getStatusVariant(row.status)') {{ row.status_label }}
              q-icon.proof-icon.proof-icon--ok(v-if='proofState(row) === "attached"', name='receipt_long', size='16px')
                q-tooltip Платёжка приложена
              q-icon.proof-icon.proof-icon--missing(v-else-if='proofState(row) === "missing"', name='receipt_long', size='16px')
                q-tooltip Платёжка не приложена
          .pay-card__row
            span.pay-card__amount
              q-icon.q-mr-xs(
                :name='getDirectionIcon(row.direction)',
                :class='isIncoming(row.direction) ? "dir--in" : "dir--out"',
                size='16px'
              )
              | {{ row.quantity }} {{ row.symbol }}
            span.pay-card__type {{ row.type_label }}
          .pay-card__row.pay-card__row--meta
            span {{ row.direction_label }}
            span {{ formatDateToHumanDateTime(row.created_at) }}
        .pay-card__actions(
          v-if='!hideActions && ["EXPIRED", "PENDING", "FAILED"].includes(row.status)',
          @click.stop
        )
          SetOrderPaidStatusButton(:id='row.id')
          SetOrderRefundedStatusButton(v-if='!isRefundType(row.type)', :id='row.id')
        template(v-if='expanded.get(row.id)')
          PaymentDetails.pay-card__details(:payment='row')
          AttachExpenseProofPanel.q-mt-sm(
            v-if='expenseProofRef(row)',
            :proposal-hash='expenseProofRef(row)?.proposal_hash ?? ""',
            :item-hash='expenseProofRef(row)?.item_hash ?? ""',
            @uploaded='onProofUploaded(row)'
          )

      .table-foot
        span {{ rangeLabel }}
        BaseButton(
          v-if='hasMore',
          variant='ghost',
          size='sm',
          :loading='onLoading',
          @click='loadMore'
        ) Загрузить ещё

  EmptyState(
    v-else,
    title='Платежи не найдены',
    body='Здесь появятся ваши платежи и взносы.'
  )
    template(#icon)
      q-icon(name='receipt_long', size='48px')
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue';
import { FailAlert } from 'src/shared/api';
import { usePaymentStore } from 'src/entities/Payment/model';
import { SetOrderPaidStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderPaidStatusButton';
import { SetOrderRefundedStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderRefundedStatusButton';
import { AttachExpenseProofPanel } from 'src/features/Payment/AttachExpenseProof';
import { PaymentDetails } from 'src/shared/ui';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import type { BaseBadgeVariant } from 'src/shared/ui/base/BaseBadge';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { TableSkeleton } from 'src/shared/ui/base/TableSkeleton';
import type { TableSkeletonColumn } from 'src/shared/ui/base/TableSkeleton';
import type { IPayment } from 'src/entities/Payment/model/types';
import { getShortNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { formatDateToHumanDateTime } from 'src/shared/lib/utils/dates/formatDateToHumanDateTime';
import { Zeus } from '@coopenomics/sdk';

const props = defineProps({
  username: {
    type: String,
    required: false,
    default: null,
  },
  hideActions: {
    type: Boolean,
    default: false,
  },
});

const paymentStore = usePaymentStore();
const payments = computed(() => paymentStore.payments);
// Zeus scalar ID не имеет резолвера → IPayment.id типизирован как unknown,
// что ломает шаблонные expanded.get/.set(row.id) и :id-биндинги. Внутри
// виджета сужаем id до string (UI-форма строки): на проводе это всегда
// строковый ID платежа.
type IPaymentRow = Omit<IPayment, 'id'> & { id: string };
const items = computed<IPaymentRow[]>(
  () => (payments.value?.items ?? []) as unknown as IPaymentRow[],
);
const onLoading = ref(false);

// Статус платежа → canon-вариант бейджа (точка + цвет из дизайн-токенов).
const statusVariants: Record<string, BaseBadgeVariant> = {
  [Zeus.PaymentStatus.COMPLETED]: 'pos',
  [Zeus.PaymentStatus.PENDING]: 'warn',
  [Zeus.PaymentStatus.FAILED]: 'neg',
  [Zeus.PaymentStatus.PAID]: 'info',
  [Zeus.PaymentStatus.REFUNDED]: 'neutral',
  [Zeus.PaymentStatus.EXPIRED]: 'neutral',
};
const getStatusVariant = (status?: string | null): BaseBadgeVariant => {
  if (!status) return 'neutral';
  return statusVariants[status] || 'neutral';
};

const isIncoming = (direction?: string | null): boolean =>
  direction === Zeus.PaymentDirection.INCOMING;

// Платежи, которые кассир не может отклонить — только «Подтвердить»:
// возврат вступительного/мин.паевого (совет уже отказал в приёме) и оплата
// расхода по СЗ (совет уже утвердил расход; отказ — только решением совета).
const isRefundType = (type?: string | null): boolean =>
  type === Zeus.PaymentType.REGISTRATION_REFUND || type === Zeus.PaymentType.EXPENSE;

// Material-иконки (канон запрещает FontAwesome fa-*).
const getDirectionIcon = (direction?: string | null) => {
  return isIncoming(direction) ? 'arrow_downward' : 'arrow_upward';
};

// Ссылка на позицию СЗ для блока «Подтверждение оплаты»: только у платежей
// расхода и только после подтверждения кассиром (платёжка появляется по факту).
const expenseProofRef = (
  row: IPaymentRow,
): { proposal_hash: string; item_hash: string } | null => {
  if (row.type !== Zeus.PaymentType.EXPENSE) return null;
  if (![Zeus.PaymentStatus.PAID, Zeus.PaymentStatus.COMPLETED].includes(row.status)) return null;
  const data = row.blockchain_data as { proposal_hash?: string; item_hash?: string } | null;
  if (!data?.proposal_hash || !data?.item_hash) return null;
  return { proposal_hash: data.proposal_hash, item_hash: data.item_hash };
};

// Отметка отчитанности оплаченного расхода: бэкенд зеркалит число платёжек
// в blockchain_data.proof_count при каждой загрузке/удалении файла.
const proofState = (row: IPaymentRow): 'attached' | 'missing' | 'none' => {
  if (!expenseProofRef(row)) return 'none';
  const count = (row.blockchain_data as { proof_count?: number } | null)?.proof_count ?? 0;
  return count > 0 ? 'attached' : 'missing';
};

// Локально отражаем загруженную платёжку, не перезагружая реестр.
const onProofUploaded = (row: IPaymentRow): void => {
  const data = (row.blockchain_data ?? {}) as { proof_count?: number };
  row.blockchain_data = { ...data, proof_count: (data.proof_count ?? 0) + 1 };
};

// Колонки скелетона повторяют шапку реальной таблицы платежей; колонка
// «Действия» появляется только когда экшены не скрыты — как и в таблице.
const skeletonColumns = computed<TableSkeletonColumn[]>(() => {
  const cols: TableSkeletonColumn[] = [
    { class: 'col-toggle', cell: 'icon' },
    { label: 'Пайщик', cell: 'text' },
    { label: 'Дата создания', cell: 'text', cellWidth: '120px' },
    { label: 'Сумма', class: 'col-num', cell: 'text', cellWidth: '64px' },
    { label: 'Тип платежа', cell: 'text' },
    { label: 'Направление', cell: 'text', cellWidth: '90px' },
    { label: 'Статус', cell: 'badge' },
  ];
  if (!props.hideActions) {
    cols.push({ label: 'Действия', class: 'col-action', cell: 'icon' });
  }
  return cols;
});

const sortState = reactive({ sortBy: '', sortDir: '' as '' | 'asc' | 'desc' });

const sortMark = (col: string): string => {
  if (sortState.sortBy !== col) return '';
  return sortState.sortDir === 'asc' ? '↑' : '↓';
};

const onSort = (col: string): void => {
  if (sortState.sortBy === col) {
    sortState.sortDir = sortState.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortState.sortBy = col;
    sortState.sortDir = 'asc';
  }
  paymentStore.clear();
  expanded.clear();
  loadPayments(1);
};

const loadPayments = async (page = 1): Promise<void> => {
  try {
    onLoading.value = true;
    const data = props.username ? { username: props.username } : undefined;
    const options = {
      page,
      limit: 25,
      sortBy: sortState.sortBy || undefined,
      sortOrder: sortState.sortDir
        ? (sortState.sortDir.toUpperCase() as 'ASC' | 'DESC')
        : 'ASC',
    };
    await paymentStore.loadPayments(data, options);

    // Платежи с ошибкой разворачиваем сразу — пользователю важна причина.
    items.value.forEach((p) => {
      if (p.status === Zeus.PaymentStatus.FAILED) expanded.set(p.id, true);
    });
  } catch (e: any) {
    FailAlert(e);
  } finally {
    onLoading.value = false;
  }
};

const hasMore = computed(
  () => (payments.value?.currentPage ?? 1) < (payments.value?.totalPages ?? 1),
);

const rangeLabel = computed(() => {
  const total = payments.value?.totalCount ?? items.value.length;
  const shown = items.value.length;
  return shown ? `1–${shown} из ${total}` : `0 из ${total}`;
});

const loadMore = (): void => {
  if (onLoading.value || !hasMore.value) return;
  loadPayments((payments.value?.currentPage ?? 1) + 1);
};

const expanded = reactive(new Map<string | number, boolean>());
const toggleExpand = (id: string | number): void => {
  expanded.set(id, !expanded.get(id));
};

onMounted(() => {
  paymentStore.clear();
  expanded.clear();
  loadPayments();
});
</script>

<style lang="scss" scoped>
.payments-table {
  width: 100%;
}

.table-scroll {
  overflow-x: auto;
}

/* Десктоп — таблица, мобайл (≤599px) — карточки. Глобальный канон
   (components.css) форсит .table { min-width:0 !important } + посимвольный
   перенос ячеек на узких экранах, из-за чего таблица из 7–8 колонок
   схлопывается в нечитаемые буквы-в-столбик. Поэтому на телефоне таблицу
   скрываем и показываем карточную раскладку (как реестр документов).
   ВАЖНО: .payments-cards ниже задаёт display:flex с той же специфичностью,
   что и одиночный .pmt-mobile, и перебивал бы display:none по порядку
   источника (карточки лезли на десктоп поверх таблицы). Поэтому скрытие/показ
   вешаем на двойной селектор .payments-cards.pmt-mobile — он специфичнее. */
.payments-cards.pmt-mobile {
  display: none;
}
@media (max-width: 599px) {
  .pmt-desktop {
    display: none;
  }
  .payments-cards.pmt-mobile {
    display: flex;
  }
}

.payments-cards {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
}

.pay-card {
  background: var(--p-surface);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-md, 12px);
  padding: var(--p-3, 12px) var(--p-4, 16px);
}

.pay-card__main {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
  cursor: pointer;
}

.pay-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-3, 12px);
}

.pay-card__name {
  font-weight: 500;
  color: var(--p-ink-1);
  /* Имя занимает свободную ширину и обрезается «…», а не рассыпается в
     столбик, когда рядом длинный бейдж статуса. */
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pay-card__amount {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.pay-card__type {
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm);
  text-align: right;
  min-width: 0;
  overflow-wrap: break-word;
}

.pay-card__row--meta {
  font-size: var(--p-fs-meta);
  color: var(--p-ink-3);
}

.pay-card__actions {
  display: flex;
  gap: var(--p-2, 8px);
  margin-top: var(--p-3, 12px);
}

.pay-card__details {
  margin-top: var(--p-3, 12px);
  padding-top: var(--p-3, 12px);
  border-top: 1px solid var(--p-line);
}

/* Глобальный канон снимает min-width (.table{min-width:0!important}) — без
   него колонки сжимаются уже контента и кнопки действий наезжают на статус.
   Перебиваем !important: при нехватке ширины таблица скроллится в
   .table-scroll, а не схлопывает колонки (как журнал уведомлений). */
.table {
  table-layout: fixed !important;
  min-width: 860px !important;
}
.table--actions {
  min-width: 980px !important;
}

.col-toggle {
  width: 44px;
  text-align: center;
}
.col-date {
  width: 132px;
  white-space: nowrap;
}
.col-action {
  width: 168px;
  text-align: right;
}

.col-sort {
  cursor: pointer;
  user-select: none;
}

/* Действия над платежом — компактной стопкой, прижатой к правому краю
   колонки (td выровнен вправо). Равная ширина кнопок — через align-items:
   stretch внутри inline-flex; слева остаётся воздух от статуса. */
.cell-actions {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--p-2, 8px);
}

.cell-name {
  overflow-wrap: break-word;
}

.dir {
  display: inline-flex;
  align-items: center;
}

.cell-status {
  display: inline-flex;
  align-items: center;
  gap: var(--p-2, 8px);
}

.proof-icon--ok {
  color: var(--p-pos);
}
.proof-icon--missing {
  color: var(--p-warn);
}
.dir--in {
  color: var(--p-pos);
}
.dir--out {
  color: var(--p-neg);
}

.no-actions {
  color: var(--p-ink-3);
}

.data-row {
  cursor: pointer;
}

.expand-row td {
  padding: 0 20px 16px;
  background: var(--p-surface-2);
}
</style>
