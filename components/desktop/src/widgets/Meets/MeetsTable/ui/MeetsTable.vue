<template lang="pug">

q-table(
  ref="tableRef"
  flat
  :grid="isMobile"
  :rows="meets"
  :columns="columns"
  :pagination="pagination"
  virtual-scroll
  :virtual-scroll-item-size="48"
  :rows-per-page-options="[10]"
  :loading='loading'
  :no-data-label="'Собрания не найдены'"
).full-height
  template(#header="props")
    q-tr(:props="props")
      q-th(
        v-for="col in props.cols"
        :key="col.name"
        :props="props"
      ) {{ col.label }}

  template(#body="props")
    q-tr(:key="`m_${props.row?.hash}`" :props="props")
      q-td {{ props.row.hash.substring(0, 10) }}
      q-td {{ props.row.processing?.meet?.type }}
      q-td {{ props.row.processing?.meet?.status }}
      q-td {{ formatDate(props.row.processing?.meet?.open_at) }}
      q-td {{ formatDate(props.row.processing?.meet?.close_at) }}
      q-td
        q-btn(
          v-if="canVote(props.row)"
          size="sm"
          color="primary"
          icon="fa-solid fa-check-to-slot"
          flat
          @click="() => $emit('vote', props.row)"
        ) Голосовать
        q-btn(
          v-if="canVote(props.row)"
          size="sm"
          color="secondary"
          icon="fa-solid fa-eye"
          flat
          @click="() => $emit('view', props.row)"
        ) Участвовать
        q-btn(
          size="sm"
          color="accent"
          icon="fa-solid fa-arrow-right"
          flat
          @click="navigateToMeetDetails(props.row)"
        ) Подробнее
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { date } from 'quasar'
import type { IMeet } from 'src/entities/Meet'
import type { QTableColumn } from 'quasar'
import { useRouter } from 'vue-router'
import { useWindowSize } from 'src/shared/hooks'
import { useDesktopStore } from 'src/entities/Desktop/model'

defineProps<{
  meets: IMeet[],
  loading: boolean
}>()

defineEmits<{
  (e: 'vote', meet: IMeet): void
  (e: 'view', meet: IMeet): void
}>()

const router = useRouter()
const { isMobile } = useWindowSize()
const desktop = useDesktopStore()

// Колонки для таблицы
const columns: QTableColumn<IMeet>[] = [
  { name: 'hash', align: 'left', label: 'ID', field: (row: IMeet) => row.hash, sortable: true },
  { name: 'type', align: 'left', label: 'Тип', field: (row: IMeet) => row.processing?.meet?.type, sortable: true },
  { name: 'status', align: 'left', label: 'Статус', field: (row: IMeet) => row.processing?.meet?.status, sortable: true },
  { name: 'open_at', align: 'left', label: 'Дата открытия', field: (row: IMeet) => row.processing?.meet?.open_at, sortable: true },
  { name: 'close_at', align: 'left', label: 'Дата закрытия', field: (row: IMeet) => row.processing?.meet?.close_at, sortable: true },
  { name: 'actions', align: 'left', label: 'Действия', field: () => '', sortable: false },
]

const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

const canVote = (meet: IMeet) => {
  return meet.processing?.meet?.status === 'open'
}

// Определение текущего воркспейса и подходящего маршрута для деталей собрания
const navigateToMeetDetails = (meet: IMeet) => {
  const currentWorkspace = desktop.activeWorkspaceName
  const isSoviet = currentWorkspace === 'soviet'
  
  const routeName = isSoviet ? 'meet-details' : 'user-meet-details'
  
  router.push({ 
    name: routeName, 
    params: { 
      hash: meet.hash,
      coopname: router.currentRoute.value.params.coopname
    } 
  })
}
</script>
