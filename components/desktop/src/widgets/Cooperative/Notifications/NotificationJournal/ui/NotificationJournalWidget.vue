<template lang="pug">
.notification-journal
  FilterBar(
    hide-search,
    :filters='filterDefs',
    :model-value='filterValues',
    @update:model-value='onFilterChange'
  )

  TableSkeleton(
    v-if='store.loading && !store.items.length',
    :columns='skeletonColumns',
    :rows='8',
    min-width='960px'
  )

  .table-wrap(v-else-if='store.items.length')
    .table-scroll
      table.table.table--actions
        thead
          tr
            th.col-date Дата
            th Получатель
            th Тип
            th Канал
            th Статус
            th.col-num Попыток
            th.col-action Действия
        tbody
          tr(v-for='row in store.items', :key='row.id')
            td.col-date {{ formatDateToHumanDateTime(row.createdAt) }}
            td.cell-recipient
              template(v-if='row.recipientUsername')
                span.cell-recipient__name(v-if='recipientName(row.recipientUsername)') {{ recipientName(row.recipientUsername) }}
                AccountBadge(:account-name='row.recipientUsername', size='sm')
              span.cell-recipient__sub(v-else) {{ row.recipientSubscriberId }}
            td {{ workflowLabel(row.workflowId) }}
            td {{ channelLabels[row.channel] ?? row.channel }}
            td(:class='{ "cell-status--has-error": row.lastError }')
              BaseBadge(:variant='statusVariant(row.status)') {{ statusLabels[row.status] ?? row.status }}
              q-tooltip(
                v-if='row.lastError',
                anchor='top middle',
                self='bottom middle',
                max-width='320px'
              ) {{ row.lastError }}
            td.col-num {{ row.attempts }}
            td.col-action(@click.stop)
              BaseButton(
                variant='ghost',
                size='sm',
                :loading='resendingId === row.id',
                @click='onResend(row.id)'
              )
                q-icon.q-mr-xs(name='refresh', size='16px')
                | Переотправить

    .table-foot
      span {{ rangeLabel }}
      BaseButton(
        v-if='store.hasMore',
        variant='ghost',
        size='sm',
        :loading='store.loading',
        @click='store.loadMore'
      ) Загрузить ещё

  EmptyState(
    v-else,
    title='Уведомления не найдены',
    body='Здесь появятся отправленные кооперативом уведомления.'
  )
    template(#icon)
      q-icon(name='notifications', size='48px')
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { Workflows } from '@coopenomics/notifications';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { BaseBadge } from 'src/shared/ui/base/BaseBadge';
import type { BaseBadgeVariant } from 'src/shared/ui/base/BaseBadge';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { TableSkeleton } from 'src/shared/ui/base/TableSkeleton';
import type { TableSkeletonColumn } from 'src/shared/ui/base/TableSkeleton';
import { AccountBadge } from 'src/shared/ui/domain/AccountBadge';
import { FilterBar } from 'src/shared/ui/domain/FilterBar';
import type { FilterDefinition, FilterValues } from 'src/shared/ui/domain/FilterBar';
import { formatDateToHumanDateTime } from 'src/shared/lib/utils/dates/formatDateToHumanDateTime';
import { getName } from 'src/shared/lib/utils/account';
import { api as accountApi } from 'src/entities/Account/api';
import { useNotificationJournalStore } from '../model';
import type { INotificationsFilter } from '../model';

const store = useNotificationJournalStore();
const resendingId = ref<string | null>(null);

// Резолв ФИО получателя по username (на фронте — DTO журнала несёт только
// username/subscriber_id). Кэш на компонент, чтобы не перезапрашивать.
const recipientNames = ref<Record<string, string>>({});

function recipientName(username?: string | null): string {
  return username ? (recipientNames.value[username] ?? '') : '';
}

async function resolveRecipientNames(): Promise<void> {
  const usernames = [
    ...new Set(
      store.items
        .map((i) => i.recipientUsername)
        .filter((u): u is string => Boolean(u)),
    ),
  ];
  const missing = usernames.filter((u) => !(u in recipientNames.value));
  if (!missing.length) return;
  await Promise.all(
    missing.map(async (username) => {
      let name = '';
      try {
        const account = await accountApi.getAccount(username);
        // getName может вернуть «undefined undefined …» если private_account
        // недоступен/пустой — вычищаем, тогда покажем только username.
        name = account
          ? (getName(account) ?? '').replace(/undefined/g, '').replace(/\s+/g, ' ').trim()
          : '';
      } catch {
        name = '';
      }
      recipientNames.value = { ...recipientNames.value, [username]: name };
    }),
  );
}

watch(() => store.items, () => void resolveRecipientNames(), { immediate: true });

const channelLabels: Record<string, string> = {
  [Zeus.NotificationChannel.EMAIL]: 'Email',
  [Zeus.NotificationChannel.IN_APP]: 'В приложении',
  [Zeus.NotificationChannel.PUSH]: 'Push',
};

const statusLabels: Record<string, string> = {
  [Zeus.NotificationOutboxStatus.PENDING]: 'В очереди',
  [Zeus.NotificationOutboxStatus.SENDING]: 'Отправляется',
  [Zeus.NotificationOutboxStatus.SENT]: 'Доставлено',
  [Zeus.NotificationOutboxStatus.FAILED]: 'Ошибка',
  [Zeus.NotificationOutboxStatus.CANCELED]: 'Отменено',
};

const statusVariants: Record<string, BaseBadgeVariant> = {
  [Zeus.NotificationOutboxStatus.PENDING]: 'warn',
  [Zeus.NotificationOutboxStatus.SENDING]: 'info',
  [Zeus.NotificationOutboxStatus.SENT]: 'pos',
  [Zeus.NotificationOutboxStatus.FAILED]: 'neg',
  [Zeus.NotificationOutboxStatus.CANCELED]: 'neutral',
};

const statusVariant = (status: string): BaseBadgeVariant => statusVariants[status] ?? 'neutral';

// Человеческое имя типа уведомления из каталога; fallback — сам id.
function workflowLabel(workflowId: string): string {
  const wf = Workflows.workflowsById?.[workflowId];
  return wf?.name ?? workflowId;
}

const filterDefs: FilterDefinition[] = [
  {
    key: 'channel',
    label: 'Канал',
    type: 'select',
    options: [
      { label: 'Email', value: Zeus.NotificationChannel.EMAIL },
      { label: 'В приложении', value: Zeus.NotificationChannel.IN_APP },
      { label: 'Push', value: Zeus.NotificationChannel.PUSH },
    ],
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { label: 'В очереди', value: Zeus.NotificationOutboxStatus.PENDING },
      { label: 'Отправляется', value: Zeus.NotificationOutboxStatus.SENDING },
      { label: 'Доставлено', value: Zeus.NotificationOutboxStatus.SENT },
      { label: 'Ошибка', value: Zeus.NotificationOutboxStatus.FAILED },
      { label: 'Отменено', value: Zeus.NotificationOutboxStatus.CANCELED },
    ],
  },
];

const filterValues = computed<FilterValues>(() => ({
  channel: store.filter.channel ?? null,
  status: store.filter.status ?? null,
}));

const skeletonColumns: TableSkeletonColumn[] = [
  { label: 'Дата', cell: 'text', cellWidth: '132px' },
  { label: 'Получатель', cell: 'text' },
  { label: 'Тип', cell: 'text' },
  { label: 'Канал', cell: 'text' },
  { label: 'Статус', cell: 'badge' },
  { label: 'Попыток', class: 'col-num', cell: 'text', cellWidth: '64px' },
  { label: 'Действия', class: 'col-action', cell: 'icon' },
];

const rangeLabel = computed(() => {
  const shown = store.items.length;
  return shown ? `1–${shown} из ${store.totalCount}` : `0 из ${store.totalCount}`;
});

async function onFilterChange(next: FilterValues): Promise<void> {
  try {
    await store.applyFilter({
      channel: (next.channel as INotificationsFilter['channel']) || undefined,
      status: (next.status as INotificationsFilter['status']) || undefined,
    });
  } catch (e: unknown) {
    FailAlert(e);
  }
}

async function onResend(id: string): Promise<void> {
  resendingId.value = id;
  try {
    await store.resend(id);
    SuccessAlert('Уведомление поставлено на переотправку');
  } catch (e: unknown) {
    FailAlert(e);
  } finally {
    resendingId.value = null;
  }
}

onMounted(() => {
  void store.load(1).catch((e: unknown) => FailAlert(e));
});
</script>

<style lang="scss" scoped>
.notification-journal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--p-4, 16px);
}

.table-scroll {
  overflow-x: auto;
}

.table {
  table-layout: fixed;
  min-width: 960px;
}

.col-date {
  width: 148px;
  white-space: nowrap;
}
.col-num {
  width: 88px;
  text-align: center;
}
.col-action {
  width: 180px;
  text-align: right;
}

.cell-recipient {
  overflow-wrap: anywhere;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.cell-recipient__name {
  color: var(--p-ink);
  font-size: var(--p-fs-body-sm, 13px);
  line-height: 1.3;
}
.cell-recipient__sub {
  font-family: var(--p-mono);
  font-size: var(--p-fs-mono-sm, 12px);
  color: var(--p-ink-2);
}
.cell-status--has-error {
  cursor: help;
}
</style>
