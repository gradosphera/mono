<template lang="pug">
.documents-table
  //- Опциональный тулбар над таблицей (фильтр типа документов и т.п.)
  .table-toolbar(v-if='$slots.top')
    slot(name='top')

  .table-loading(v-if='loading && !documents.length')
    q-spinner(size='32px', color='primary')
  .table-wrap(v-else-if='documents.length')
    .table-scroll
      table.table
        thead
          tr
            th.col-toggle
            th.col-id ID
            th Документ
            th.col-signers Подписи
            th.col-action Действия
        tbody
          template(v-for='row in documents', :key='rowId(row)')
            tr.data-row(@click='toggleExpand(rowId(row))')
              td.col-toggle
                button.icon-btn(
                  type='button',
                  :aria-label='expanded.get(rowId(row)) ? "Свернуть" : "Развернуть"',
                  @click.stop='toggleExpand(rowId(row))'
                )
                  q-icon(:name='expanded.get(rowId(row)) ? "expand_more" : "chevron_right"')
              td.col-id
                span.mono {{ getDocumentHash(row).substring(0, 10) }}
              td
                .doc-primary {{ getDocumentTitle(row) }}
              td.col-signers {{ getSignersFromDocumentPackage(row) }}
              td.col-action(@click.stop)
                button.icon-btn(
                  type='button',
                  aria-label='Скачать пакет',
                  :disabled='downloadingPackages.get(rowId(row))',
                  @click='downloadPackage(row)'
                )
                  q-icon(name='download')

            tr.expand-row(v-if='expanded.get(rowId(row))')
              td(colspan='5')
                ComplexDocument(:documents='row')

    .table-foot
      span {{ rangeLabel }}
      BaseButton(
        v-if='hasMore',
        variant='ghost',
        size='sm',
        :loading='loading',
        @click='$emit("load")'
      ) Загрузить ещё

  EmptyState(
    v-else,
    title='Документы не найдены',
    body='Здесь появятся ваши документы и подписанные соглашения.'
  )
    template(#icon)
      q-icon(name='description', size='48px')
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { ComplexDocument } from 'src/shared/ui/ComplexDocument';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { FailAlert } from 'src/shared/api';
import {
  prepareDocumentPackageArchive,
  getSignersFromDocumentPackage,
} from 'src/shared/lib/document';
import type { IDocumentPackageAggregate } from 'src/entities/Document/model';

interface IPagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const props = defineProps<{
  documents: IDocumentPackageAggregate[];
  loading: boolean;
  pagination?: IPagination;
}>();

const emit = defineEmits<{
  (e: 'load'): void;
  (e: 'toggle-expand', id: string): void;
}>();

const expanded = reactive(new Map<string, boolean>());
const downloadingPackages = reactive(new Map<string, boolean>());

// Идентификатор строки: global_sequence заявления (стабилен в рамках пакета).
function rowId(row: IDocumentPackageAggregate): string {
  return String(
    (row as any)?.id ?? row?.statement?.action?.global_sequence ?? '',
  );
}

function getDocumentTitle(row: IDocumentPackageAggregate): string {
  return (
    row.statement?.documentAggregate?.rawDocument?.full_title ||
    row.decision?.documentAggregate?.rawDocument?.full_title ||
    'Документ без заголовка'
  );
}

function getDocumentHash(row: IDocumentPackageAggregate): string {
  return (
    row.statement?.documentAggregate?.rawDocument?.hash ||
    row.decision?.documentAggregate?.rawDocument?.hash ||
    'нет хеша'
  );
}

const hasMore = computed(
  () => (props.pagination?.currentPage ?? 1) < (props.pagination?.totalPages ?? 1),
);

const rangeLabel = computed(() => {
  const total = props.pagination?.totalCount ?? props.documents.length;
  const shown = props.documents.length;
  return shown ? `1–${shown} из ${total}` : `0 из ${total}`;
});

const toggleExpand = (id: string): void => {
  if (!id) return;
  expanded.set(id, !expanded.get(id));
  emit('toggle-expand', id);
};

const downloadPackage = async (
  packageAggregate: IDocumentPackageAggregate,
): Promise<void> => {
  const packageId = packageAggregate?.statement?.action?.global_sequence;
  if (!packageId) return;
  try {
    downloadingPackages.set(String(packageId), true);
    const { blob, archiveName } = await prepareDocumentPackageArchive(
      packageAggregate,
    );
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
    downloadingPackages.delete(String(packageId));
  }
};
</script>

<style lang="scss" scoped>
.documents-table {
  width: 100%;
}

.table-toolbar {
  margin-bottom: var(--p-3, 12px);
}

.table-loading {
  display: flex;
  justify-content: center;
  padding: var(--p-8, 32px);
}

/* Горизонтальный скролл на узких экранах вместо мобильной карточной верстки. */
.table-scroll {
  overflow-x: auto;
}

.table {
  table-layout: fixed;
  min-width: 760px;
}

.col-toggle {
  width: 44px;
  text-align: center;
}
.col-id {
  width: 130px;
}
.col-signers {
  width: 200px;
  overflow-wrap: anywhere;
}
.col-action {
  width: 110px;
  text-align: center;
}

.mono {
  font-family: var(--p-mono);
  font-size: var(--p-fs-mono-sm, 12px);
  color: var(--p-ink-2);
}

.doc-primary {
  overflow-wrap: anywhere;
}

.data-row {
  cursor: pointer;
}

.expand-row td {
  padding: 0 20px 16px;
  background: var(--p-surface-2);
}
</style>
