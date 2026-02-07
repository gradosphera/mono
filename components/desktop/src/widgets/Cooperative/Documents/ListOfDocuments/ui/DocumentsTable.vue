<template lang="pug">
.scroll-area(style='height: calc(100% - $toolbar-min-height); overflow-y: auto')
  q-table.q-mb-md.documents-table(
    ref='tableRef',
    flat,
    :grid='isMobile',
    :rows='documents',
    :columns='columns',
    :table-colspan='9',
    :loading='loading',
    :no-data-label='"документы не найдены"',
    :virtual-scroll='!!documents.length',
    @virtual-scroll='onScroll',
    :virtual-scroll-target='".scroll-area"',
    :virtual-scroll-item-size='48',
    :virtual-scroll-sticky-size-start='48',
    :rows-per-page-options='[0]',
    :pagination='pagination',
    :class='{ "my-sticky-dynamic": documents.length > 0 }'
  )
    template(#top, v-if='$slots.top')
      slot(name='top')
    template(#item='props')
      DocumentCard(
        :document='props.row',
        :expanded='!!expanded.get(props.row?.statement?.action?.global_sequence)',
        @toggle-expand='toggleExpand(props.row?.statement?.action?.global_sequence)'
      )

    template(#header='props')
      q-tr(:props='props')
        q-th(auto-width)
        q-th(v-for='col in props.cols', :key='col.name', :props='props') {{ col.label }}

    template(#body='props')
      q-tr(
        :key='`m_${props.row?.id || props.row?.statement?.action?.global_sequence}`',
        :props='props'
      )
        q-td(auto-width)
          ExpandToggleButton(
            :expanded='expanded.get(props.row?.id || props.row?.statement?.action?.global_sequence)',
            @click='toggleExpand(props.row?.id || props.row?.statement?.action?.global_sequence)'
          )

        q-td {{ getDocumentHash(props.row).substring(0, 10) || '' }}
        q-td(style="max-width: 400px; word-wrap: break-word; white-space: normal") {{ getDocumentTitle(props.row) }}
        q-td.text-center
          q-btn(
            size='sm',
            flat
            icon='fa-solid fa-download',
            @click='downloadPackage(props.row)',
            :loading='downloadingPackages.has(props.row?.statement?.action?.global_sequence)'
          )

      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded.get(props.row?.id || props.row?.statement?.action?.global_sequence)',
        :key='`e_${props.row?.id || props.row?.statement?.action?.global_sequence}`',
        :props='props'
      )
        q-td(colspan='100%')
          ComplexDocument(:documents='props.row')
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ComplexDocument } from 'src/shared/ui/ComplexDocument';
import { DocumentCard } from './';
import { useWindowSize } from 'src/shared/hooks';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';
import { FailAlert } from 'src/shared/api';
import { prepareDocumentPackageArchive } from 'src/shared/lib/document';
import type { IDocumentPackageAggregate } from 'src/entities/Document/model';

// Props
const props = defineProps<{
  documents: IDocumentPackageAggregate[];
  loading: boolean;
}>();

// Emits - определяем события, которые компонент может эмитить
const emit = defineEmits<{
  (e: 'load'): void;
  (e: 'toggle-expand', id: string): void;
}>();

// Локальное состояние
const expanded = reactive(new Map<string, boolean>());
const downloadingPackages = reactive(new Map<string, boolean>());
const pagination = ref({
  rowsPerPage: 0,
});
const tableRef = ref(null);
const { isMobile } = useWindowSize();

// Функция обработки виртуального скролла
const onScroll = ({ to }) => {
  const lastIndex = props.documents.length - 1;
  // Если достигли последнего элемента в списке, эмитим событие load
  if (to === lastIndex) {
    emit('load');
  }
};

// Получение заголовка документа из агрегата
function getDocumentTitle(row: IDocumentPackageAggregate) {
  // Используем документы из агрегатов
  if (row.statement?.documentAggregate?.rawDocument?.full_title) {
    return row.statement.documentAggregate.rawDocument.full_title;
  }

  // Проверяем решения
  if (row.decision?.documentAggregate?.rawDocument?.full_title) {
    return row.decision.documentAggregate.rawDocument.full_title;
  }

  // По умолчанию
  return 'Документ без заголовка';
}

// Получение хеша документа из агрегата
function getDocumentHash(row: IDocumentPackageAggregate) {
  if (row.statement?.documentAggregate?.rawDocument?.hash) {
    return row.statement.documentAggregate.rawDocument.hash;
  }

  if (row.decision?.documentAggregate?.rawDocument?.hash) {
    return row.decision.documentAggregate.rawDocument.hash;
  }

  return 'нет хеша';
}

// Колонки таблицы
const columns: any[] = [
  {
    name: 'hash',
    align: 'left',
    label: 'ID',
    field: (row: any) => getDocumentHash(row).substring(0, 10) || '',
    sortable: true,
  },
  {
    name: 'title',
    align: 'left',
    label: 'Документ',
    field: (row: any) => getDocumentTitle(row),
    sortable: true,
  },
  {
    name: 'actions',
    align: 'center',
    label: 'Действия',
  },
];

// Функция для переключения состояния развертывания
const toggleExpand = (id: any) => {
  if (!id) return;
  expanded.set(id, !expanded.get(id));
  emit('toggle-expand', id);
};

// Функция скачивания пакета документов
const downloadPackage = async (packageAggregate: IDocumentPackageAggregate) => {
  const packageId = packageAggregate?.statement?.action?.global_sequence;
  if (!packageId) return;

  try {
    downloadingPackages.set(packageId, true);

    const { blob, archiveName } = await prepareDocumentPackageArchive(packageAggregate);

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${archiveName}.zip`;

    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Ошибка при скачивании пакета документов:', error);
    FailAlert('Не удалось подготовить архив пакета документов');
  } finally {
    downloadingPackages.delete(packageId);
  }
};
</script>
<style>
.documents-table .q-table__top {
  padding: 0px !important;
}
</style>
