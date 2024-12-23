<template lang="pug">
  div.row.justify-center
    div.col-12
      q-table(
        v-if="orders && orders.results"
        ref="tableRef"
        class="my-sticky-dynamic"
        flat
        :rows="orders.results"
        row-key="id"
        :columns="columns"
        :table-colspan="9"
        :loading="onLoading"
        :no-data-label="'ордера не найдены'"
        virtual-scroll
        @virtual-scroll="onScroll"
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        :rows-per-page-options="[0]"
        :pagination="pagination"
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
          q-tr(:key="`m_${props.row.order_num}`" :props="props")
            q-td(auto-width)
              q-btn(size="sm" color="primary" round dense :icon="expanded.get(props.row.order_num) ? 'remove' : 'add'" @click="toggleExpand(props.row.order_num)")
            q-td {{props.row.order_num}}
            q-td {{getNameFromUserData(props.row.user?.private_data)}}
            q-td {{props.row.user?.username}}
            q-td
              q-badge(v-if="props.row.type ==='registration'") регистрационный
              q-badge(v-if="props.row.type ==='deposit'") паевый

            q-td {{ props.row.quantity }}
            q-td {{ formatToHumanDate(props.row.createdAt) }}
            //- q-td {{ formatToHumanDate(props.row.updatedAt) }}
            //- q-td {{ formatToFromNow(props.row.expired_at) }}
            q-td
              q-badge(v-if="props.row.status ==='completed'" color="teal") обработан
              q-badge(v-if="props.row.status ==='pending'" color="orange") ожидание оплаты
              q-badge(v-if="props.row.status ==='failed'" color="red") ошибка
              q-badge(v-if="props.row.status ==='paid'" color="orange") оплачен
              q-badge(v-if="props.row.status ==='refunded'" color="grey") отменён
            q-td
              q-btn-dropdown(size="sm" label="действия" flat dense v-model="dropdowns[props.row.order_num]")
                q-list(dense)
                  SetOrderPaidStatusButton(:id="props.row.id" @close="closeDropdown(props.row.order_num)")
                  SetOrderRefundedStatusButton(:id="props.row.id" @close="closeDropdown(props.row.order_num)")
                  //- SetOrderCompletedStatusButton(:id="props.row.id" @close="closeDropdown(props.row.order_num)")

          q-tr(v-if="expanded.get(props.row.order_num)" :key="`e_${props.row.order_num}`" :props="props" class="q-virtual-scroll--with-prev")
            q-td(colspan="100%")
              div(v-if="props.row.status=='failed'")
                p Причина ошибки: {{props.row.message}}

</template>
<script setup lang="ts">
  import { onMounted, ref, computed, reactive, nextTick } from 'vue'
  import { Notify } from 'quasar'
  import { getNameFromUserData } from 'src/shared/lib/utils/getNameFromUserData';
  import { formatToHumanDate } from 'src/shared/lib/utils/dates/formatToHumanDate';
  import { useOrderStore } from 'src/entities/Order';
  import { SetOrderPaidStatusButton } from 'src/features/Order/SetStatus/ui/SetOrderPaidStatusButton';
  import { SetOrderRefundedStatusButton } from 'src/features/Order/SetStatus/ui/SetOrderRefundedStatusButton';
  // import { SetOrderCompletedStatusButton } from 'src/features/Cooperative/Orders/SetStatus/ui/SetOrderCompletedStatusButton';

  const orderStore = useOrderStore()
  const orders = computed(() => orderStore.orders)
  const onLoading = ref(false)
  const nextPage = ref(1)
  const lastPage = ref(1);

  const dropdowns = reactive({})

  const sortState = reactive({
    sortBy: '',
    sortDir: ''
  })

  const sortedQuery = computed(() => {
    if (sortState.sortBy && sortState.sortDir)
      return `${sortState.sortBy}:${sortState.sortDir}`
    else return ''
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
  orderStore.clear()
  nextPage.value = 1
  lastPage.value = 1
  loadOrders(1) // Перезагружаем с новыми параметрами сортировки
}

  const closeDropdown = (id: string) => {
    dropdowns[id] = false // Закрываем дропдаун для конкретной строки
  }

  const props = defineProps({
    receiver: {
      type: String,
      required: false,
      default: null
    },
  })

  const loadOrders = async (page = 1) => {
    try {
      onLoading.value = true
      await orderStore.loadCoopOrders({username: props.receiver, page, limit: 25, sortBy: sortedQuery.value})
      lastPage.value = orderStore.orders?.totalPages || 1
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
    if(orders.value) {

      const lastIndex = orders.value.results.length - 1

      if (onLoading.value !== true && nextPage.value < lastPage.value && to === lastIndex) {
        onLoading.value = true

        setTimeout(() => {
          nextPage.value++
          loadOrders(nextPage.value) // Загружаем следующую страницу

          nextTick(() => {
            ref.refresh() // Обновляем виртуальный скролл после загрузки
            onLoading.value = false
          })
        }, 500) // Имитируем задержку загрузки
      }
    }
  }

  onMounted(() => {
    loadOrders()
  })


  const columns = [
    { name: 'order_num', align: 'left', label: '№', field: 'order_num', sortable: true },
    { name: 'name', align: 'left', label: 'ФИО | Наименование', field: '', sortable: false },
    { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
    { name: 'type', align: 'left', label: 'Тип платежа', field: 'type', sortable: true },
    { name: 'quantity', align: 'left', label: 'Сумма', field: '', sortable: false },
    { name: 'createdAt', align: 'left', label: 'Создан', field: 'createdAt', sortable: true },
    // { name: 'updatedAt', align: 'left', label: 'Обновлён', field: 'updatedAt', sortable: true },
    // { name: 'expiredAt', align: 'left', label: 'Истекает', field: 'expired_at', sortable: true },
    { name: 'status', align: 'left', label: 'Статус', field: '', sortable: true },
    { name: 'action', align: 'left', label: '', field: 'action', sortable: false },

  ] as any

  const expanded = reactive(new Map()) // Используем Map для отслеживания состояния развертывания каждой записи

  // Функция для переключения состояния развертывания
  const toggleExpand = (id: any) => {
    expanded.set(id, !expanded.get(id))
  }

  const tableRef = ref(null)
  const pagination = ref({ rowsPerPage: 0 })
  </script>

<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  height: 100vh

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px

</style>
<style>
.q-list--dense > .q-item, .q-item--dense {
  padding: 0px !important;
}
</style>
