<template lang="pug">
q-table.full-height(
  flat,
  :grid='isMobile',
  :rows='accounts',
  :columns='columns',
  row-key='id',
  :pagination='pagination',
  virtual-scroll,
  :virtual-scroll-item-size='48',
  :loading='loading',
  :no-data-label='"План счетов не найден"'
)
  //- template(#top)
  //-   slot(name='top')

  template(#header='props')
    q-tr(:props='props')
      q-th(v-for='col in props.cols', :key='col.name', :props='props') {{ col.label }}

  template(#body='props')
    q-tr(:key='`account_${props.row.id}`', :props='props')
      q-td(auto-width)
        q-btn(
          size='sm',
          color='primary',
          round,
          dense,
          :icon='expanded.get(props.row.id) ? "expand_more" : "chevron_right"',
          @click='toggleExpand(props.row.id)'
        )
      q-td {{ props.row.displayId }}
      q-td(
        style='max-width: 300px; word-wrap: break-word; white-space: normal'
      ) {{ props.row.name }}
      q-td.text-right {{ formatAsset2Digits(props.row.available) }}
      q-td.text-right {{ formatAsset2Digits(props.row.blocked) }}
      q-td.text-right {{ formatAsset2Digits(props.row.writeoff) }}

    //- Развернутая строка с историей операций для конкретного счета
    q-tr.q-virtual-scroll--with-prev(
      no-hover,
      v-if='expanded.get(props.row.id)',
      :key='`e_${props.row.id}`',
      :props='props'
    )
      q-td(colspan='100%')
        .q-pa-md
          .text-h6.q-mb-md История операций счёта {{ props.row.displayId }}. {{ props.row.name }}
          LedgerHistoryTable(
            :filter='getAccountHistoryFilter(props.row.id)',
            :hide-account-column='true',
            @error='handleHistoryError'
          )

  template(#item='props')
    .col-12
      q-card.q-pa-md.q-mb-sm
        .row.q-gutter-y-md
          .col-12
            .row.items-center.q-gutter-x-md
              .col-auto
                q-btn(
                  size='sm',
                  color='primary',
                  round,
                  dense,
                  :icon='expanded.get(props.row.id) ? "expand_more" : "chevron_right"',
                  @click='toggleExpand(props.row.id)'
                )
              .col
                .text-body1 {{ props.row.displayId }}. {{ props.row.name }}
          .col-12
            .row
              .col-12.col-sm-4.q-pa-xs
                .text-caption.text-grey-6.q-mb-xs Доступно
                .text-body1.text-weight-medium.q-pa-sm.rounded-borders(
                  style='background: rgba(76, 175, 80, 0.1); color: #2e7d32'
                ) {{ formatAsset2Digits(props.row.available) }}
              .col-12.col-sm-4.q-pa-xs
                .text-caption.text-grey-6.q-mb-xs Заблокировано
                .text-body1.text-weight-medium.q-pa-sm.rounded-borders(
                  style='background: rgba(255, 152, 0, 0.1); color: #ef6c00'
                ) {{ formatAsset2Digits(props.row.blocked) }}
              .col-12.col-sm-4.q-pa-xs
                .text-caption.text-grey-6.q-mb-xs Списано
                .text-body1.text-weight-medium.q-pa-sm.rounded-borders(
                  style='background: rgba(244, 67, 54, 0.1); color: #c62828'
                ) {{ formatAsset2Digits(props.row.writeoff) }}

          //- Развернутая история для мобильной версии
          .col-12(v-if='expanded.get(props.row.id)')
            q-separator.q-my-md
            .text-h6.q-mb-md История операций счёта {{ props.row.displayId }}. {{ props.row.name }}
            LedgerHistoryTable(
              :filter='getAccountHistoryFilter(props.row.id)',
              :hide-account-column='true',
              @error='handleHistoryError'
            )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWindowSize } from 'src/shared/hooks';
import { formatAsset2Digits } from 'src/shared/lib/utils';
import { useSystemStore } from 'src/entities/System/model';
import { LedgerHistoryTable } from '.';
import type {
  ILedgerAccount,
  ILedgerHistoryFilter,
} from 'src/entities/LedgerAccount';

// Props
defineProps<{
  accounts: ILedgerAccount[];
  loading: boolean;
}>();

// Emits
const emit = defineEmits<{
  historyError: [error: any];
}>();

// Локальное состояние
const pagination = ref({ rowsPerPage: 0 });
const { isMobile } = useWindowSize();
const { info } = useSystemStore();

// Состояние развернутых строк
const expanded = ref(new Map<number, boolean>());

// Функция переключения разворота
const toggleExpand = (accountId: number) => {
  const isExpanded = expanded.value.get(accountId);
  expanded.value.set(accountId, !isExpanded);
};

// Создание фильтра для истории конкретного счета
const getAccountHistoryFilter = (accountId: number): ILedgerHistoryFilter => ({
  coopname: info.coopname,
  account_id: accountId,
});

// Обработчик ошибок истории
const handleHistoryError = (error: any) => {
  emit('historyError', error);
};

// Колонки таблицы (добавлена колонка для кнопки разворота)
const columns: any[] = [
  {
    name: 'expand',
    align: 'left',
    label: '',
    field: 'expand',
    sortable: false,
  },
  {
    name: 'id',
    align: 'left',
    label: 'ID счёта',
    field: 'id',
    sortable: true,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Наименование счёта',
    field: 'name',
    sortable: true,
  },
  {
    name: 'available',
    align: 'right',
    label: 'Доступно',
    field: 'available',
    sortable: true,
  },
  {
    name: 'blocked',
    align: 'right',
    label: 'Заблокировано',
    field: 'blocked',
    sortable: true,
  },
  {
    name: 'writeoff',
    align: 'right',
    label: 'Списано',
    field: 'writeoff',
    sortable: true,
  },
];
</script>
