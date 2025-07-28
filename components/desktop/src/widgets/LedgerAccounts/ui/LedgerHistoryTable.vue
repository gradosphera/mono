<template lang="pug">
.ledger-history-widget
  q-table.full-height(
    flat,
    :grid='isMobile',
    :rows='operations',
    :columns='columns',
    row-key='global_sequence',
    :pagination='tablePagination',
    virtual-scroll,
    :virtual-scroll-item-size='48',
    :loading='loading',
    :no-data-label='"История операций не найдена"',
    @virtual-scroll='onVirtualScroll'
  )
    template(#header='props')
      q-tr(:props='props')
        q-th(v-for='col in props.cols', :key='col.name', :props='props') {{ col.label }}

    template(#body='props')
      q-tr(:key='`operation_${props.row.global_sequence}`', :props='props')
        q-td {{ formatDate(props.row.created_at) }}
        q-td
          q-badge(
            outline,
            :color='getActionColor(props.row.action)',
            size='sm'
          ) {{ getActionLabel(props.row.action) }}
        q-td.text-left {{ props.row.quantity || '-' }}
        q-td(v-if='!hideAccountColumn') {{ getAccountsInfo(props.row) }}

        q-td(
          style='max-width: 200px; word-wrap: break-word; white-space: normal'
        )
          | {{ props.row.comment || '-' }}

    template(#item='props')
      .col-12
        q-card.q-pa-md.q-mb-sm
          .row.q-gutter-y-sm
            .col-12
              .row.items-center.q-gutter-x-md
                .col-auto
                  q-chip(
                    :color='getActionColor(props.row.action)',
                    text-color='white',
                    size='sm'
                  ) {{ getActionLabel(props.row.action) }}
                .col
                  .text-caption.text-grey-6 {{ formatDate(props.row.created_at) }}
            .col-12(v-if='!hideAccountColumn')
              .text-body2.text-weight-medium {{ getAccountsInfo(props.row) }}
            .col-12(v-if='props.row.quantity')
              .text-body1.text-weight-bold.text-primary {{ props.row.quantity }}
            .col-12(v-if='props.row.comment')
              .text-caption.text-grey-7 {{ props.row.comment }}

  //- Индикатор загрузки внизу списка
  .row.justify-center.q-pa-md(v-if='loading && operations.length > 0')
    q-spinner(color='primary', size='2em')
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useWindowSize } from 'src/shared/hooks';
import {
  useLocalLedgerHistory,
  useLedgerAccountStore,
} from 'src/entities/LedgerAccount/model';
import type {
  ILedgerOperation,
  ILedgerHistoryFilter,
  ILedgerTransferOperation,
} from 'src/entities/LedgerAccount/types';

// Props
const props = defineProps<{
  filter: ILedgerHistoryFilter;
  accountFilter?: number;
  hideAccountColumn?: boolean;
}>();

// Emits
const emit = defineEmits<{
  error: [error: any];
}>();

// Локальное состояние истории операций
const {
  operations,
  loading,
  hasMore,
  loadHistory,
  loadMoreHistory,
  changeFilter,
} = useLocalLedgerHistory();

// Store для получения данных о счетах
const ledgerStore = useLedgerAccountStore();

// UI состояние
const { isMobile } = useWindowSize();
const tablePagination = ref({ rowsPerPage: 0 });

// Колонки таблицы
const columns = computed(() => {
  const baseColumns = [
    {
      name: 'created_at',
      align: 'left' as const,
      label: 'Дата',
      field: 'created_at',
      sortable: false,
    },
    {
      name: 'action',
      align: 'left' as const,
      label: 'Операция',
      field: 'action',
      sortable: false,
    },
    {
      name: 'quantity',
      align: 'left' as const,
      label: 'Сумма',
      field: 'quantity',
      sortable: false,
    },
    {
      name: 'comment',
      align: 'left' as const,
      label: 'Комментарий',
      field: 'comment',
      sortable: false,
    },
  ];

  // Добавляем колонку "Счет" только если она не скрыта
  if (!props.hideAccountColumn) {
    baseColumns.splice(3, 0, {
      name: 'accounts',
      align: 'left' as const,
      label: 'Счет',
      field: 'accounts',
      sortable: false,
    });
  }

  return baseColumns;
});

// Загрузка данных при монтировании
onMounted(async () => {
  try {
    await loadHistory(props.filter);
  } catch (error) {
    emit('error', error);
  }
});

// Обработка виртуального скролла для бесконечной загрузки
const onVirtualScroll = async (details: any) => {
  if (
    details.to === operations.value.length - 1 &&
    hasMore.value &&
    !loading.value
  ) {
    try {
      await loadMoreHistory();
    } catch (error) {
      emit('error', error);
    }
  }
};

// Вспомогательные функции
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    add: 'green',
    sub: 'red',
    transfer: 'blue',
    block: 'orange',
    unblock: 'teal',
  };
  return colors[action] || 'grey';
};

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    add: 'Дебет',
    sub: 'Кредит',
    transfer: 'Перевод',
    block: 'Блокировка',
    unblock: 'Разблокировка',
  };
  return labels[action] || action;
};

const getAccountsInfo = (operation: ILedgerOperation): string => {
  const accounts = ledgerStore.ledgerState?.chartOfAccounts || [];

  const getAccountDisplayName = (accountId: number): string => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account
      ? `${account.displayId}. ${account.name}`
      : `Счет ${accountId}`;
  };

  // Для переводов показываем источник и назначение
  if (operation.action === 'transfer') {
    const transferOp = operation as ILedgerTransferOperation;
    const fromAccountName = getAccountDisplayName(transferOp.from_account_id);
    const toAccountName = getAccountDisplayName(transferOp.to_account_id);
    return `${fromAccountName} → ${toAccountName}`;
  }

  // Для остальных операций показываем один счет
  const accountId = (operation as any).account_id;
  return accountId ? getAccountDisplayName(accountId) : '-';
};

// Экспорт методов для внешнего управления
defineExpose({
  changeFilter,
  loadHistory,
  loadMoreHistory,
});
</script>

<style scoped>
.ledger-history-widget {
  width: 100%;
}
</style>
