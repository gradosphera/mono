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
    no-data-label='У кооператива нет участников Благороста'
  )

    template(#body='props')
      q-tr(:props='props')
        q-td
          .row.items-center
            ExpandToggleButton(
              :expanded='isExpanded(props.row.contributor_hash)',
              @click='handleToggleExpand(props.row.contributor_hash)'
            )

        q-td {{ props.row.display_name || '-' }}
        q-td
          q-chip(
            :color='getContributorStatusColor(props.row.status)',
            text-color='white',
            :label='getContributorStatusLabel(props.row.status)',
            size='sm'
          )


        q-td.text-right {{ formatAsset2Digits(calculateInvestorTotal(props.row)) }}
        q-td.text-right {{ formatAsset2Digits(props.row.contributed_as_creator) }}
        q-td.text-right {{ formatAsset2Digits(props.row.contributed_as_author) }}
        q-td.text-right {{ formatAsset2Digits(props.row.contributed_as_coordinator) }}
        q-td.text-right {{ formatAsset2Digits(props.row.contributed_as_contributor) }}
        q-td.text-right {{ formatAsset2Digits(props.row.rate_per_hour) }}
        q-td.text-right {{ props.row.hours_per_day || '-' }}
        q-td.text-right {{ formatAsset2Digits(calculateTotalContribution(props.row)) }}

      // Раскрывающаяся строка с информацией "О себе"
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='isExpanded(props.row.contributor_hash)',
        :key='`${props.row.contributor_hash}-about`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          .q-pa-md
            .text-subtitle2.q-mb-sm О себе
            .text-body2 {{ props.row.about || 'Информация отсутствует' }}
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import type { IContributor } from 'app/extensions/capital/entities/Contributor/model/types';
import { formatAsset2Digits } from 'src/shared/lib/utils';
import { getContributorStatusColor, getContributorStatusLabel } from 'app/extensions/capital/shared/lib/contributorStatus';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';
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
    name: 'expand',
    label: '',
    align: 'left' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'username',
    label: 'ФИО',
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
    name: 'investor_propertor',
    label: 'Инвестор',
    align: 'right' as const,
    field: 'contributed_as_investor' as const,
    sortable: true,
  },
  {
    name: 'creator',
    label: 'Исполнитель',
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
    label: 'Участник',
    align: 'right' as const,
    field: 'contributed_as_contributor' as const,
    sortable: true,
  },
  {
    name: 'rate_per_hour',
    label: 'Ставка/час',
    align: 'right' as const,
    field: 'rate_per_hour' as const,
    sortable: true,
  },
  {
    name: 'hours_per_day',
    label: 'Часы/день',
    align: 'right' as const,
    field: 'hours_per_day' as const,
    sortable: true,
  },
  {
    name: 'total',
    label: 'Общий вклад',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
  },
];

// Состояние для раскрывающихся строк
const expanded = reactive<Record<string, boolean>>({});

// Функция для безопасного получения состояния раскрытия
const isExpanded = (contributorHash: string) => {
  return expanded[contributorHash] || false;
};

// Обработчик переключения раскрытия
const handleToggleExpand = (contributorHash: string) => {
  expanded[contributorHash] = !expanded[contributorHash];
};

// Функция для расчета суммы инвестора + пропертора
const calculateInvestorTotal = (contributor: IContributor) => {
  const investor = Number(contributor?.contributed_as_investor?.split(' ')[0] || '0');
  const propertor = Number(contributor?.contributed_as_propertor?.split(' ')[0] || '0');
  const total = investor + propertor;
  const currency = contributor?.contributed_as_investor?.split(' ')[1] ||
                  contributor?.contributed_as_propertor?.split(' ')[1] || '';
  return currency ? `${total} ${currency}` : total.toString();
};

// Функция для расчета общего вклада
const calculateTotalContribution = (contributor: IContributor) => {
  const investor = Number(contributor?.contributed_as_investor?.split(' ')[0] || '0');
  const creator = Number(contributor?.contributed_as_creator?.split(' ')[0] || '0');
  const author = Number(contributor?.contributed_as_author?.split(' ')[0] || '0');
  const coordinator = Number(contributor?.contributed_as_coordinator?.split(' ')[0] || '0');
  const contributorAmount = Number(contributor?.contributed_as_contributor?.split(' ')[0] || '0');
  const propertor = Number(contributor?.contributed_as_propertor?.split(' ')[0] || '0');

  const total = investor + creator + author + coordinator + contributorAmount + propertor;

  // Определяем валюту из любого поля, которое ее содержит
  const currency = contributor?.contributed_as_investor?.split(' ')[1] ||
                  contributor?.contributed_as_creator?.split(' ')[1] ||
                  contributor?.contributed_as_author?.split(' ')[1] ||
                  contributor?.contributed_as_coordinator?.split(' ')[1] ||
                  contributor?.contributed_as_contributor?.split(' ')[1] ||
                  contributor?.contributed_as_propertor?.split(' ')[1] || '';

  return currency ? `${total} ${currency}` : total.toString();
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
