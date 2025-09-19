<template lang="pug">
q-card(flat)
  q-table(
    :rows='contributors',
    :columns='columns',
    row-key='contributor_hash',
    :loading='loading',
    :pagination='pagination',
    @request='onRequest',
    binary-state-sort,
    flat,
    square,
    no-data-label='У кооператива нет вкладчиков'
  )
    template(#body='props')
      q-tr(:props='props')
        q-td {{ props.row.username || '-' }}
        q-td
          q-chip(
            :color='getStatusColor(props.row.status)',
            text-color='white',
            :label='getStatusLabel(props.row.status)',
            size='sm'
          )
        q-td.text-right {{ formatCurrency(props.row.debt_amount) }}
        q-td.text-right {{ formatCurrency(props.row.contributed_as_investor) }}
        q-td.text-right {{ formatCurrency(props.row.contributed_as_creator) }}
        q-td.text-right {{ formatCurrency(props.row.contributed_as_author) }}
        q-td.text-right {{ formatCurrency(props.row.contributed_as_coordinator) }}
        q-td.text-right {{ formatCurrency(props.row.contributed_as_contributor) }}
        q-td.text-right {{ formatCurrency(props.row.contributed_as_propertor) }}
</template>

<script lang="ts" setup>
import type { IContributor } from 'app/extensions/capital/entities/Contributor/model/types';

interface Props {
  contributors: IContributor[];
  loading?: boolean;
  pagination?: {
    page: number;
    rowsPerPage: number;
    sortBy: string;
    descending: boolean;
  };
}

interface Emits {
  (e: 'request', props: { pagination: any }): void;
}

withDefaults(defineProps<Props>(), {
  contributors: () => [],
  loading: false,
  pagination: () => ({
    page: 1,
    rowsPerPage: 25,
    sortBy: 'created_at',
    descending: true,
  }),
});

const emit = defineEmits<Emits>();

// Определяем столбцы таблицы
const columns = [
  {
    name: 'username',
    label: 'Имя пользователя',
    align: 'left' as const,
    field: 'username' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'center' as const,
    field: 'status' as const,
    sortable: true,
  },
  {
    name: 'debt_amount',
    label: 'Долг',
    align: 'right' as const,
    field: 'debt_amount' as const,
    sortable: true,
  },
  {
    name: 'investor',
    label: 'Инвестор',
    align: 'right' as const,
    field: 'contributed_as_investor' as const,
    sortable: true,
  },
  {
    name: 'creator',
    label: 'Создатель',
    align: 'right' as const,
    field: 'contributed_as_creator' as const,
    sortable: true,
  },
  {
    name: 'author',
    label: 'Автор',
    align: 'right' as const,
    field: 'contributed_as_author' as const,
    sortable: true,
  },
  {
    name: 'coordinator',
    label: 'Координатор',
    align: 'right' as const,
    field: 'contributed_as_coordinator' as const,
    sortable: true,
  },
  {
    name: 'contributor',
    label: 'Вкладчик',
    align: 'right' as const,
    field: 'contributed_as_contributor' as const,
    sortable: true,
  },
  {
    name: 'propertor',
    label: 'Собственник',
    align: 'right' as const,
    field: 'contributed_as_propertor' as const,
    sortable: true,
  },
];

// Методы форматирования
const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'positive';
    case 'inactive':
      return 'warning';
    case 'blocked':
      return 'negative';
    default:
      return 'grey';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Активный';
    case 'inactive':
      return 'Неактивный';
    case 'blocked':
      return 'Заблокирован';
    default:
      return status;
  }
};

// Обработчик запросов пагинации и сортировки
const onRequest = (props: { pagination: any }) => {
  emit('request', props);
};
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}
</style>
