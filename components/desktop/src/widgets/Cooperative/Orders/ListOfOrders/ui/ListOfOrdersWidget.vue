<template lang="pug">
  div.row.justify-center
    div.col-12
      div.scroll-area(style="height: calc(100% - $toolbar-min-height); overflow-y: auto;")
        q-table(
          v-if="payments && payments.items"
          ref="tableRef"
          flat
          :grid="isMobile"
          :rows="payments.items"
          row-key="id"
          :columns="columns"
          :table-colspan="9"
          :loading="onLoading"
          :no-data-label="'платежи не найдены'"
          virtual-scroll
          @virtual-scroll="onScroll"
          :virtual-scroll-target="'.scroll-area'"
          :virtual-scroll-item-size="48"
          :virtual-scroll-sticky-size-start="48"
          :rows-per-page-options="[0]"
          :pagination="pagination"
          class="q-mb-md"
        )
          template(#item="props")
            OrderCard(
              :order="props.row"
              :expanded="expanded.get(props.row.id)"
              :hideActions="hideActions"
              @toggle-expand="toggleExpand(props.row.id)"
            )

          template(#header="props")
            q-tr(:props="props")
              q-th(auto-width)
              q-th(
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                @click="onSort(col)"
              ) {{ col.label }}

          template(#body="props")
            q-tr(:key="`m_${props.row.id}`" :props="props")
              q-td(auto-width)
                q-btn(
                  size="sm"
                  color="primary"
                  round
                  dense
                  :icon="expanded.get(props.row.id) ? 'remove' : 'add'"
                  @click="toggleExpand(props.row.id)"
                )
              q-td {{props.row.id}}
              q-td {{ props.row.amount }} {{props.row.symbol}}
              q-td
                q-badge(v-if="props.row.details.data.includes('registration')") регистрационный
                q-badge(v-else) паевой

              q-td(style="max-width: 150px; word-wrap: break-word; white-space: normal;") {{props.row.username}}


              q-td
                q-badge(v-if="props.row.status ==='COMPLETED'" color="teal") обработан
                q-badge(v-if="props.row.status ==='PENDING'" color="orange") ожидание оплаты
                q-badge(v-if="props.row.status ==='FAILED'" color="red") ошибка
                q-badge(v-if="props.row.status ==='PAID'" color="orange") оплачен
                q-badge(v-if="props.row.status ==='REFUNDED'" color="grey") отменён
                q-badge(v-if="props.row.status ==='EXPIRED'" color="grey") истёк
              q-td
                SetOrderPaidStatusButton(
                  v-if="!hideActions && ['EXPIRED', 'PENDING', 'FAILED'].includes(props.row.status)"
                  :id="props.row.id"
                )
                span(v-else-if="!hideActions").text-grey нет доступных действий

            q-tr(v-if="expanded.get(props.row.id)" :key="`e_${props.row.id}`" :props="props" class="q-virtual-scroll--with-prev")
              q-td(colspan="100%")
                div(v-if="props.row.status=='FAILED'")
                  span Причина ошибки: {{props.row.message ?? 'нет дополнительной информации'}}
                div(v-else)
                  span нет дополнительной информации
</template>
<script setup lang="ts">
  import { onMounted, ref, computed, reactive, nextTick } from 'vue'
  import { Notify } from 'quasar'
  import { usePaymentStore } from 'src/entities/Payment/model';
  import { SetOrderPaidStatusButton } from 'src/features/Payment/SetStatus/ui/SetOrderPaidStatusButton';
  import OrderCard from './OrderCard.vue';
  import { useWindowSize } from 'src/shared/hooks';

  const paymentStore = usePaymentStore()
  const payments = computed(() => paymentStore.payments)
  const onLoading = ref(false)
  const nextPage = ref(1)
  const lastPage = ref(1);
  const { isMobile } = useWindowSize()

  const sortState = reactive({
    sortBy: '',
    sortDir: ''
  })

  const onSort = (col) => {
    if (!col.sortable) return

    // Меняем направление сортировки, если кликнули на тот же столбец
    if (sortState.sortBy === col.name) {
      sortState.sortDir = sortState.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      // Если сортируем новый столбец, сбрасываем на 'asc'
      sortState.sortBy = col.name
      sortState.sortDir = 'asc'
    }
    paymentStore.clear()
    nextPage.value = 1
    lastPage.value = 1
    loadPayments(1) // Перезагружаем с новыми параметрами сортировки
  }

  const props = defineProps({
    username: {
      type: String,
      required: false,
      default: null
    },
    hideActions: {
      type: Boolean,
      default: false
    }
  })

  const loadPayments = async (page = 1) => {
    try {
      onLoading.value = true

      // Данные для фильтрации
      const data = props.username ? { username: props.username } : undefined;

      // Опции пагинации и сортировки
      const options = {
        page,
        limit: 25,
        sortBy: sortState.sortBy || undefined,
        sortOrder: sortState.sortDir ? sortState.sortDir.toUpperCase() as 'ASC' | 'DESC' : 'ASC'
      };

      await paymentStore.loadPayments(data, options);

      if (payments.value) {
        lastPage.value = payments.value.totalPages || 1
      }

      onLoading.value = false
    } catch (e: any) {
      onLoading.value = false
      console.log(e)
      Notify.create({
        message: e.message,
        type: 'negative',
      })
    }
  }

  // Функция обработки виртуального скролла
  const onScroll = ({ to, ref }) => {
    if(payments.value) {
      const lastIndex = payments.value.items.length - 1

      if (onLoading.value !== true && nextPage.value < lastPage.value && to === lastIndex) {
        onLoading.value = true

        setTimeout(() => {
          nextPage.value++
          loadPayments(nextPage.value) // Загружаем следующую страницу

          nextTick(() => {
            ref.refresh() // Обновляем виртуальный скролл после загрузки
            onLoading.value = false
          })
        }, 500) // Имитируем задержку загрузки
      }
    }
  }

  onMounted(() => {
    paymentStore.clear()
    loadPayments()
  })


  const columns: any[] = [
    { name: 'id', align: 'left', label: '№', field: 'id', sortable: true },
    { name: 'amount', align: 'left', label: 'Сумма', field: 'amount', sortable: true },
    { name: 'type', align: 'left', label: 'Тип платежа', field: '', sortable: false },
    { name: 'username', align: 'left', label: 'От кого', field: 'username', sortable: true },
    { name: 'status', align: 'left', label: 'Статус', field: 'status', sortable: true },
    { name: 'actions', align: 'left', label: '', field: '', sortable: false, hide: props.hideActions },
  ] as any

  const expanded = reactive(new Map()) // Используем Map для отслеживания состояния развертывания каждой записи

  // Функция для переключения состояния развертывания
  const toggleExpand = (id: any) => {
    expanded.set(id, !expanded.get(id))
  }

  const tableRef = ref(null)
  const pagination = ref({ rowsPerPage: 0 })
  </script>

<style>
.q-list--dense > .q-item, .q-item--dense {
  padding: 0px !important;
}
</style>
