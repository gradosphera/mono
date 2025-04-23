<template lang="pug">
q-table(
  ref="tableRef"
  flat
  :grid="isMobile"
  :rows="documents"
  :columns="columns"
  :table-colspan="9"
  :pagination="pagination"
  virtual-scroll
  :virtual-scroll-item-size="48"
  :rows-per-page-options="[10]"
  :loading='loading'
  :no-data-label="'документы не найдены'"
).full-height
  template(#top v-if="$slots.top")
    slot(name="top")

  template(#item="props")
    DocumentCard(
      :document="props.row"
      :expanded="!!expanded.get(props.row?.statement?.action?.global_sequence)"
      @toggle-expand="toggleExpand(props.row?.statement?.action?.global_sequence)"
    )

  template(#header="props")
    q-tr(:props="props")
      q-th(auto-width)
      q-th(
        v-for="col in props.cols"
        :key="col.name"
        :props="props"
      ) {{ col.label }}

  template(#body="props")
    q-tr(:key="`m_${props.row?.statement?.action?.global_sequence}`" :props="props")
      q-td(auto-width)
        q-btn(
          size="sm"
          color="primary"
          round
          dense
          :icon="expanded.get(props.row?.statement?.action?.global_sequence) ? 'remove' : 'add'"
          @click="toggleExpand(props.row?.statement?.action?.global_sequence)"
        )

      q-td {{ props.row.statement?.action?.data?.document.hash?.substring(0, 10) || '' }}
      q-td {{ props.row.statement?.document?.full_title || '' }}

    q-tr(
      v-if="expanded.get(props.row?.statement?.action?.global_sequence)"
      :key="`e_${props.row?.statement?.action?.global_sequence}`"
      :props="props"
      class="q-virtual-scroll--with-prev"
    )
      q-td(colspan="100%")
        ComplexDocument(:documents="props.row")
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ComplexDocument } from 'src/shared/ui/ComplexDocument'
import { DocumentCard } from './'
import { useWindowSize } from 'src/shared/hooks'
import { Cooperative } from 'cooptypes';

// Props
const props = defineProps<{
  documents: Cooperative.Document.IComplexDocument[]
  loading: boolean
}>()

// Сбрасываем expanded при изменении documents и логируем
// eslint-disable-next-line @typescript-eslint/no-unused-vars
watch(() => props.documents, (newDocs) => {
  expanded.clear()
}, { deep: true })

// Emits
const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void
}>()

// Локальное состояние
const expanded = reactive(new Map<string, boolean>())
const pagination = ref({ rowsPerPage: 10 })
const tableRef = ref(null)
const { isMobile } = useWindowSize()

// Колонки таблицы
const columns:any[] = [
  { 
    name: 'hash', 
    align: 'left', 
    label: 'ID', 
    field: (row: Cooperative.Document.IComplexDocument) => row.statement?.action?.data?.document.hash?.substring(0, 10) || '', 
    sortable: true 
  },
  { 
    name: 'title', 
    align: 'left', 
    label: 'Документ', 
    field: (row: Cooperative.Document.IComplexDocument) => row.statement?.document?.full_title || '', 
    sortable: true 
  },
]

// Функция для переключения состояния развертывания
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id))
  emit('toggle-expand', id)
}
</script>
