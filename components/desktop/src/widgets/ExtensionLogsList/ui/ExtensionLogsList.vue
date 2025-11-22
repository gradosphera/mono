<template lang="pug">
div
  .q-pa-md
    .row.q-mb-md
      .col-md-6.col-sm-6.col-xs-12.q-pa-sm
        q-input(
          v-model="dateFrom"
          type="date"
          label="Дата от"
          filled
          dense
          clearable
          @clear="handleFilterChange"
          @update:model-value="handleFilterChange"
        )

      .col-md-6.col-sm-6.col-xs-12.q-pa-sm
        q-input(
          v-model="dateTo"
          type="date"
          label="Дата до"
          filled
          dense
          clearable
          @clear="handleFilterChange"
          @update:model-value="handleFilterChange"
        )

    q-table.full-height(
      flat
      v-model:pagination="pagination"
      :rows="logs"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :no-data-label="'Логи не найдены'"
      @request="onRequest"
    )
      template(#body="props")
        q-tr(:props="props")
          q-td {{ showGlobalIds ? props.row.id : props.row.extension_local_id }}
          q-td {{ formatDate(props.row.created_at) }}
          q-td
            slot(name="log-item" :log="JSON.parse(props.row.data || '{}')" :row="props.row" :showGlobalIds="showGlobalIds")
              // Default slot content - show raw JSON
              pre {{ props.row.data }}
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useExtensionStore, type IExtensionLogsResult } from 'src/entities/Extension/model/store'
import { date } from 'quasar'

interface Props {
  extensionName?: string
  showGlobalIds?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  extensionName: undefined,
  showGlobalIds: false
})

const extensionStore = useExtensionStore()

// Reactive data
const logs = ref<any[]>([])
const loading = ref(false)
const dateFrom = ref('')
const dateTo = ref('')

// Table configuration
const columns = [
  {
    name: 'id',
    label: 'ID',
    align: 'left' as const,
    field: 'id' as const,
    style: 'width: 80px'
  },
  {
    name: 'created_at',
    label: 'Дата',
    align: 'left' as const,
    field: 'created_at' as const,
    style: 'width: 140px'
  },
  {
    name: 'data',
    label: 'Данные',
    align: 'left' as const,
    field: 'data' as const
  }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
})

// Methods
const formatDate = (dateString: string) => {
  return date.formatDate(new Date(dateString), 'DD.MM.YYYY HH:mm')
}

const handleFilterChange = () => {
  pagination.value.page = 1 // Reset to first page when filters change
  loadLogs()
}

const onRequest = (props: any) => {
  const { page, rowsPerPage } = props.pagination
  loadLogs(page, rowsPerPage)
}

const loadLogs = async (
  page = pagination.value.page,
  rowsPerPage = pagination.value.rowsPerPage
) => {
  loading.value = true
  try {
    const filter: any = {}

    // Always use extensionName prop if provided
    if (props.extensionName) {
      filter.name = props.extensionName
    }

    if (dateFrom.value) {
      filter.createdFrom = new Date(dateFrom.value)
    }

    if (dateTo.value) {
      filter.createdTo = new Date(dateTo.value)
    }

    const options = {
      page,
      limit: rowsPerPage,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }

    const result: IExtensionLogsResult = await extensionStore.loadExtensionLogs({ data: filter, options })

    logs.value = result.items
    pagination.value.rowsNumber = result.totalCount
    pagination.value.page = result.currentPage
  } catch (error) {
    console.error('Error loading extension logs:', error)
  } finally {
    loading.value = false
  }
}

// No need to watch extensionName changes as it's fixed for this component instance

// Initial load
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.full-height {
  height: calc(100vh - 200px);
}
</style>
