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
      q-td {{ props.row.displayId }}
      q-td(
        style='max-width: 300px; word-wrap: break-word; white-space: normal'
      ) {{ props.row.name }}
      q-td.text-right {{ formatAsset2Digits(props.row.available) }}
      q-td.text-right {{ formatAsset2Digits(props.row.blocked) }}
      q-td.text-right {{ formatAsset2Digits(props.row.writeoff) }}

  template(#item='props')
    .col-12
      q-card.q-pa-md.q-mb-sm
        .row.q-gutter-y-md
          .col-12
            .row.items-center.q-gutter-x-md
              .col-12
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWindowSize } from 'src/shared/hooks';
import { formatAsset2Digits } from 'src/shared/lib/utils';
import type { ILedgerAccount } from 'src/entities/LedgerAccount';

// Props
defineProps<{
  accounts: ILedgerAccount[];
  loading: boolean;
}>();

// Локальное состояние
const pagination = ref({ rowsPerPage: 0 });
const { isMobile } = useWindowSize();

// Колонки таблицы
const columns: any[] = [
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
