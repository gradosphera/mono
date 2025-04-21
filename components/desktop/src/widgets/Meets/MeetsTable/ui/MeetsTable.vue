<template lang="pug">
q-table(
  ref="tableRef"
  flat
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
      q-th(auto-width)
      q-th(
        v-for="col in props.cols"
        :key="col.name"
        :props="props"
      ) {{ col.label }}

  template(#body="props")
    q-tr(:key="`m_${props.row?.hash}`" :props="props")
      q-td(auto-width)
        q-btn(size="sm" color="primary" round dense :icon="expanded.get(props.row?.hash) ? 'remove' : 'add'" @click="toggleExpand(props.row?.hash)")
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

    q-tr(v-if="expanded.get(props.row?.hash)" :key="`e_${props.row?.hash}`" :props="props" class="q-virtual-scroll--with-prev")
      q-td(colspan="100%")
        MeetInfoCard(
          :meet="props.row"
          :can-manage="canManageMeet(props.row)"
          :can-close="canClose(props.row)"
          :can-restart="canRestart(props.row)"
          @close="$emit('close', props.row)"
          @restart="$emit('restart', props.row)"
        )
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { date } from 'quasar'
import { MeetInfoCard } from '../../MeetInfoCard'
import type { IMeet } from 'src/entities/Meet'

const props = defineProps<{
  meets: IMeet[],
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'vote', meet: IMeet): void
  (e: 'close', meet: IMeet): void
  (e: 'restart', meet: IMeet): void
}>()

// Колонки для таблицы
const columns = [
  { name: 'hash', align: 'left', label: 'ID', field: 'hash', sortable: true },
  { name: 'type', align: 'left', label: 'Тип', field: row => row.processing?.meet?.type, sortable: true },
  { name: 'status', align: 'left', label: 'Статус', field: row => row.processing?.meet?.status, sortable: true },
  { name: 'open_at', align: 'left', label: 'Дата открытия', field: row => row.processing?.meet?.open_at, sortable: true },
  { name: 'close_at', align: 'left', label: 'Дата закрытия', field: row => row.processing?.meet?.close_at, sortable: true },
  { name: 'actions', align: 'left', label: 'Действия', field: 'actions', sortable: false },
]

// Состояние развернутых строк
const expanded = reactive(new Map())

// Функция для переключения состояния развертывания
const toggleExpand = (id: string) => {
  expanded.set(id, !expanded.get(id))
}

const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return date.formatDate(dateString, 'DD.MM.YYYY HH:mm')
}

// Проверки разрешений
const canManageMeet = (meet: IMeet) => {
  return true // Здесь можно добавить проверку ролей
}

const canClose = (meet: IMeet) => {
  return meet.processing?.meet?.status === 'open'
}

const canRestart = (meet: IMeet) => {
  return meet.processing?.meet?.status === 'closed'
}

const canVote = (meet: IMeet) => {
  return meet.processing?.meet?.status === 'open'
}
</script>
