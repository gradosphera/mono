<template>
  <div style="width: 100%">
    <q-table v-model:pagination="pagination" flat bordered dense :loading="loading" :rows="rows" :columns="columns"
      row-key="k" style="width: 100%" @request="changePageFromTable">
      <template #body-cell-transaction_id="p">
        <q-td :props="p">
          {{ p.row.transaction_id.substring(0, 10) }}
        </q-td>
      </template>
      <template #body-cell-data="p">
        <q-td :props="p">
          <DataCell :action-data="p.value" :action="p.row.action" :contract="p.row.contract"></DataCell>
        </q-td>
      </template>
      <template #body-cell-action="p">
        <q-td :props="p">
          <ActionCell :action-data="p.value" :account="props.username"></ActionCell>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import moment from 'moment-with-locales-es6'
import { QTableProps } from 'quasar'
import ActionCell from 'src/components/explorer/ActionCell.vue'
import DataCell from 'src/components/explorer/DataCell.vue'

const props = defineProps<{
  username: string
}>()

const loading = ref(false)

const pagination = ref({
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rows = ref<any[]>([])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: QTableProps['columns'] = [
  // {
  //   name: 'transaction_id',
  //   required: true,
  //   label: 'ID транзакции',
  //   align: 'left',
  //   field: (row: any) => row.transaction_id,
  // },
  {
    name: 'timestamp',
    required: true,
    label: 'Дата',
    align: 'center',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: (row: any) => moment(row.timestamp).format('DD.MM.YY HH:mm:ss'),
  },
  {
    name: 'action',
    required: true,
    label: 'Действие',
    align: 'center',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: (row: any) => row,
  },
  {
    name: 'data',
    required: true,
    label: 'Данные',
    align: 'center',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: (row: any) => row.data,
  },
  // {
  //   name: 'memo',
  //   required: true,
  //   label: 'Памятка',
  //   align: 'right',
  //   field: (row: any) => row.data.memo,
  // },
]

const loadPage = async () => {
  // if (loading.value) {
  //   return
  // }
  // loading.value = true
  // const rootChain = chains.getRootChain()
  // const explorer = rootChain.explorer
  // const data = await explorer
  //   .getHistoryActions(
  //     props.username,
  //     pagination.value.rowsPerPage,
  //     pagination.value.rowsPerPage * (pagination.value.page - 1)
  //   )
  //   .catch(() => ({ data: null }))

  // if (data) {
  //   pagination.value = {
  //     ...pagination.value,
  //     rowsNumber: data.total.value,
  //   }
  //   rows.value = data.simple_actions.map((r: any, i: number) => ({
  //     ...r,
  //     k: `${i}-${r.action}-${r.transaction_id}-${r.contract}`,
  //   }))
  // }
  // loading.value = false
}

watch(
  () => pagination.value.page,
  () => {
    loadPage()
  },
  { immediate: true }
)

const changePageFromTable = (e: any) => {
  if (e && e.pagination) {
    pagination.value = e.pagination
    loadPage()
  }
}

onMounted(() => {
  setTimeout(() => {
    loadPage()
  }, 3000)
})
</script>

<style lang="scss" scoped></style>
