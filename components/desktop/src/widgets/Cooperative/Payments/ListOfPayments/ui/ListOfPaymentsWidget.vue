<template lang="pug">
.row.justify-center
  .col-12
    .scroll-area(
      style='height: calc(100% - $toolbar-min-height); overflow-y: auto'
    )
      q-table.q-mb-md(
        v-if='payments && payments.items',
        ref='tableRef',
        flat,
        :grid='isMobile',
        :rows='payments.items',
        row-key='id',
        :columns='columns',
        :table-colspan='9',
        :loading='onLoading',
        :no-data-label='"платежи не найдены"',
        virtual-scroll,
        @virtual-scroll='onScroll',
        :virtual-scroll-target='".scroll-area"',
        :virtual-scroll-item-size='48',
        :virtual-scroll-sticky-size-start='48',
        :rows-per-page-options='[0]',
        :pagination='pagination'
      )
        template(#item='props')
          PaymentCard(
            :payment='props.row',
            :expanded='expanded.get(props.row.id)',
            :hideActions='hideActions',
            @toggle-expand='toggleExpand(props.row.id)'
          )
        template(#header='props')
          q-tr(:props='props')
            q-th(auto-width)
            q-th(
              v-for='col in props.cols',
              :key='col.name',
              :props='props',
              @click='onSort(col)'
            ) {{ col.label }}

        template(#body='props')
          q-tr(:key='`m_${props.row.id}`', :props='props')
            q-td(auto-width)
              q-btn(
                size='sm',
                color='primary',
                round,
                dense,
                :icon='expanded.get(props.row.id) ? "expand_more" : "chevron_right"',
                @click='toggleExpand(props.row.id)'
              )
            q-td(
              style='max-width: 150px; word-wrap: break-word; white-space: normal'
            ) {{ getShortNameFromCertificate(props.row.username_certificate) || props.row.username }}

            q-td {{ props.row.quantity }} {{ props.row.symbol }}
            q-td {{ props.row.type_label }}

            q-td
              q-icon.q-mr-xs(
                :name='getDirectionIcon(props.row.direction)',
                :color='getDirectionColor(props.row.direction)',
                size='sm'
              )
              span {{ props.row.direction_label }}

            q-td
              q-badge(:color='getStatusColor(props.row.status)') {{ props.row.status_label }}

            q-td
              SetOrderPaidStatusButton(
                v-if='!hideActions && ["EXPIRED", "PENDING", "FAILED"].includes(props.row.status)',
                :id='props.row.id'
              )
              span.text-grey(v-else-if='!hideActions') нет доступных действий

          q-tr.q-virtual-scroll--with-prev(
            no-hover,
            v-if='expanded.get(props.row.id)',
            :key='`e_${props.row.id}`',
            :props='props'
          )
            q-td(colspan='100%')
              PaymentDetails(:payment='props.row')
</template>
<script setup lang="ts">
import { onMounted, ref, computed, reactive, nextTick } from 'vue';
import { Notify } from 'quasar';
import { usePaymentStore } from 'src/entities/Payment/model';
import { SetOrderPaidStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderPaidStatusButton';
import PaymentCard from './PaymentCard.vue';
import { PaymentDetails } from 'src/shared/ui';
import { useWindowSize } from 'src/shared/hooks';
import { getShortNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { Zeus } from '@coopenomics/sdk';
// import { getName } from 'src/shared/lib/utils';

const statusColors: Record<string, string> = {
  [Zeus.PaymentStatus.COMPLETED]: 'teal',
  [Zeus.PaymentStatus.PENDING]: 'orange',
  [Zeus.PaymentStatus.FAILED]: 'red',
  [Zeus.PaymentStatus.PAID]: 'blue',
  [Zeus.PaymentStatus.REFUNDED]: 'grey',
  [Zeus.PaymentStatus.EXPIRED]: 'grey',
};

const getStatusColor = (status?: string | null) => {
  if (!status) {
    return 'grey';
  }
  return statusColors[status] || 'grey';
};

const getDirectionIcon = (direction?: string | null) => {
  return direction === Zeus.PaymentDirection.INCOMING
    ? 'fa-solid fa-arrow-down'
    : 'fa-solid fa-arrow-up';
};

const getDirectionColor = (direction?: string | null) => {
  return direction === Zeus.PaymentDirection.INCOMING ? 'positive' : 'negative';
};

const paymentStore = usePaymentStore();
const payments = computed(() => paymentStore.payments);
const onLoading = ref(false);
const nextPage = ref(1);
const lastPage = ref(1);
const { isMobile } = useWindowSize();

const sortState = reactive({
  sortBy: '',
  sortDir: '',
});

const onSort = (col) => {
  if (!col.sortable) return;

  // Меняем направление сортировки, если кликнули на тот же столбец
  if (sortState.sortBy === col.name) {
    sortState.sortDir = sortState.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    // Если сортируем новый столбец, сбрасываем на 'asc'
    sortState.sortBy = col.name;
    sortState.sortDir = 'asc';
  }
  paymentStore.clear();
  nextPage.value = 1;
  lastPage.value = 1;
  loadPayments(1); // Перезагружаем с новыми параметрами сортировки
};

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

const loadPayments = async (page = 1) => {
  try {
    onLoading.value = true;

    // Данные для фильтрации
    const data = props.username ? { username: props.username } : undefined;

    // Опции пагинации и сортировки
    const options = {
      page,
      limit: 25,
      sortBy: sortState.sortBy || undefined,
      sortOrder: sortState.sortDir
        ? (sortState.sortDir.toUpperCase() as 'ASC' | 'DESC')
        : 'ASC',
    };

    await paymentStore.loadPayments(data, options);

    if (payments.value) {
      lastPage.value = payments.value.totalPages || 1;
    }

    onLoading.value = false;
  } catch (e: any) {
    onLoading.value = false;
    console.log(e);
    Notify.create({
      message: e.message,
      type: 'negative',
    });
  }
};

// Функция обработки виртуального скролла
const onScroll = ({ to, ref }) => {
  if (payments.value) {
    const lastIndex = payments.value.items.length - 1;

    if (
      onLoading.value !== true &&
      nextPage.value < lastPage.value &&
      to === lastIndex
    ) {
      onLoading.value = true;

      setTimeout(() => {
        nextPage.value++;
        loadPayments(nextPage.value); // Загружаем следующую страницу

        nextTick(() => {
          ref.refresh(); // Обновляем виртуальный скролл после загрузки
          onLoading.value = false;
        });
      }, 500); // Имитируем задержку загрузки
    }
  }
};

onMounted(() => {
  paymentStore.clear();
  loadPayments();
});

const columns: any[] = [
  // { name: 'id', align: 'left', label: '№', field: 'id', sortable: true },
  {
    name: 'username',
    align: 'left',
    label: 'Пайщик',
    field: 'username',
    sortable: true,
  },
  {
    name: 'quantity',
    align: 'left',
    label: 'Сумма',
    field: 'quantity',
    sortable: true,
  },
  {
    name: 'type',
    align: 'left',
    label: 'Тип платежа',
    field: 'type',
    sortable: false,
  },
  {
    name: 'direction',
    align: 'left',
    label: 'Направление',
    field: 'direction',
    sortable: false,
  },
  {
    name: 'status',
    align: 'left',
    label: 'Статус',
    field: 'status',
    sortable: true,
  },
  {
    name: 'actions',
    align: 'left',
    label: '',
    field: '',
    sortable: false,
    hide: props.hideActions,
  },
] as any;

const expanded = reactive(new Map()); // Используем Map для отслеживания состояния развертывания каждой записи

// Функция для переключения состояния развертывания
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id));
};

const tableRef = ref(null);
const pagination = ref({ rowsPerPage: 0 });
</script>

<style>
.q-list--dense > .q-item,
.q-item--dense {
  padding: 0px !important;
}
</style>
