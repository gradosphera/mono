<template lang="pug">
div.scroll-area(style="height: 90vh; overflow-y: auto;")
  q-table(
    ref="tableRef"
    flat
    :grid="isMobile"
    :rows="documents"
    :columns="columns"
    :table-colspan="9"
    :loading='loading'
    :no-data-label="'документы не найдены'"
    :virtual-scroll="!!documents.length"
    @virtual-scroll="onScroll"
    :virtual-scroll-target="'.scroll-area'"
    :virtual-scroll-item-size="48"
    :virtual-scroll-sticky-size-start="48"
    :rows-per-page-options="[0]"
    :pagination="pagination"
    :class="{'my-sticky-dynamic': documents.length > 0}"
    class="q-mb-md"
  ).documents-table
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
      q-tr(:key="`m_${props.row?.id || props.row?.statement?.action?.global_sequence}`" :props="props")
        q-td(auto-width)
          q-btn(
            size="sm"
            color="primary"
            round
            dense
            :icon="expanded.get(props.row?.id || props.row?.statement?.action?.global_sequence) ? 'remove' : 'add'"
            @click="toggleExpand(props.row?.id || props.row?.statement?.action?.global_sequence)"
          )

        q-td {{ getDocumentHash(props.row).substring(0, 10) || '' }}
        q-td {{ getDocumentTitle(props.row) }}

      q-tr(
        no-hover
        v-if="expanded.get(props.row?.id || props.row?.statement?.action?.global_sequence)"
        :key="`e_${props.row?.id || props.row?.statement?.action?.global_sequence}`"
        :props="props"
        class="q-virtual-scroll--with-prev"
      )
        q-td(colspan="100%")
          ComplexDocument(:documents="props.row")

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ComplexDocument } from 'src/shared/ui/ComplexDocument'
import { DocumentCard } from './'
import { useWindowSize } from 'src/shared/hooks'
import type { IDocumentPackageAggregate } from 'src/entities/Document/model'

// Props
const props = defineProps<{
  documents: IDocumentPackageAggregate[]
  loading: boolean
}>()

// Emits - определяем события, которые компонент может эмитить
const emit = defineEmits<{
  (e: 'load'): void
  (e: 'toggle-expand', id: string): void
}>()

// Локальное состояние
const expanded = reactive(new Map<string, boolean>())
const pagination = ref({
  rowsPerPage: 0
})
const tableRef = ref(null)
const { isMobile } = useWindowSize()

// Функция обработки виртуального скролла
const onScroll = ({ to }) => {

  const lastIndex = props.documents.length - 1
  // Если достигли последнего элемента в списке, эмитим событие load
  if (to === lastIndex) {
    emit('load')
  }
}

// Получение заголовка документа из агрегата
function getDocumentTitle(row: IDocumentPackageAggregate) {
  // Используем документы из агрегатов
  if (row.statement?.documentAggregate?.rawDocument?.full_title) {
    return row.statement.documentAggregate.rawDocument.full_title
  }

  // Проверяем решения
  if (row.decision?.documentAggregate?.rawDocument?.full_title) {
    return row.decision.documentAggregate.rawDocument.full_title
  }

  // По умолчанию
  return 'Документ без заголовка'
}

// Получение хеша документа из агрегата
function getDocumentHash(row: IDocumentPackageAggregate) {
  if (row.statement?.documentAggregate?.rawDocument?.hash) {
    return row.statement.documentAggregate.rawDocument.hash
  }

  if (row.decision?.documentAggregate?.rawDocument?.hash) {
    return row.decision.documentAggregate.rawDocument.hash
  }

  return 'нет хеша'
}

// Колонки таблицы
const columns:any[] = [
  {
    name: 'hash',
    align: 'left',
    label: 'ID',
    field: (row: any) => getDocumentHash(row).substring(0, 10) || '',
    sortable: true
  },
  {
    name: 'title',
    align: 'left',
    label: 'Документ',
    field: (row: any) => getDocumentTitle(row),
    sortable: true
  },

]

// Функция для переключения состояния развертывания
const toggleExpand = (id: any) => {
  if (!id) return
  expanded.set(id, !expanded.get(id))
  emit('toggle-expand', id)
}
</script>
<style>
.documents-table .q-table__top{
  padding: 0px !important;
}
</style>