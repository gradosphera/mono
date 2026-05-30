<template lang="pug">
DocumentsTable(
  :documents='documentStore.documents',
  :loading='documentStore.loading',
  :pagination='documentStore.pagination',
  :expand-hash='documentHash',
  @toggle-expand='toggleExpand',
  @load='loadMoreDocuments'
)
  template(#top, v-if='showFilter')
    .full-width
      q-btn-toggle.full-width(
        size='sm',
        :model-value='typeForToggle',
        @update:model-value='onTypeChange',
        spread,
        unelevated,
        toggle-color='primary',
        :options='[ { label: "Все входящие", value: "newsubmitted" }, { label: "Только утверждённые", value: "newresolved" }, ]'
      )
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onBeforeUnmount } from 'vue';
import { DocumentModel } from 'src/entities/Document';
import { DocumentsTable } from '../ui';
import { FailAlert } from 'src/shared/api';
import type { DocumentType } from 'src/entities/Document/model/types';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  filter: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  showFilter: {
    type: Boolean,
    required: false,
    default: false,
  },
  initialDocumentType: {
    type: String as () => DocumentType,
    required: false,
    default: 'newsubmitted',
  },
});

const emit = defineEmits(['toggle-expand']);

// Получаем store документов
const documentStore = DocumentModel.useDocumentStore();

// Переменная для отслеживания типа в интерфейсе
const typeForToggle = ref<DocumentType>(props.initialDocumentType);

// Реестр может быть наведён на конкретный документ из поиска: filter.document.hash.
const documentHash = computed<string>(() => String((props.filter as any)?.document?.hash ?? ''));
const hasDocumentFilter = computed<boolean>(() => documentHash.value.length > 0);

// При фильтре по одному документу не ограничиваем статус (newsubmitted = все статусы),
// иначе на вкладке «только утверждённые» неутверждённый документ из поиска не нашёлся бы.
const effectiveType = computed<DocumentType>(() =>
  hasDocumentFilter.value ? 'newsubmitted' : typeForToggle.value,
);

// Обработчик изменения типа документов
async function onTypeChange(newType: DocumentType) {
  if (newType === 'newresolved' || newType === 'newsubmitted') {
    typeForToggle.value = newType;
    try {
      await documentStore.changeDocumentType(
        newType,
        props.username,
        props.filter,
      );
    } catch (e) {
      FailAlert(e);
    }
  }
}

// Функция для загрузки следующей страницы документов
async function loadMoreDocuments() {
  try {
    // Проверяем, не загружаются ли уже документы
    if (documentStore.loading) {
      return;
    }

    const nextPage = documentStore.pagination.currentPage + 1;

    if (nextPage <= documentStore.pagination.totalPages)
      await documentStore.changePage(nextPage, props.username, props.filter);
  } catch (e) {
    FailAlert(e);
  }
}

// Функция для переключения состояния раскрытия
function toggleExpand(document: any) {
  emit('toggle-expand', document);
}

// Периодическое обновление данных
let interval: number | null = null;

// Перезагрузка списка с текущим фильтром и эффективным типом (форс newsubmitted при hash-фильтре).
async function reload() {
  documentStore.resetDocuments();
  try {
    await documentStore.changeDocumentType(effectiveType.value, props.username, props.filter);
  } catch (e) {
    FailAlert(e);
  }
}

// Загрузка документов при монтировании
onMounted(reload);

// Наведение реестра на документ из поиска меняет filter — перезагружаем список.
watch(
  () => props.filter,
  () => {
    void reload();
  },
  { deep: true },
);

// Очистка таймера при размонтировании компонента
onBeforeUnmount(() => {
  if (interval !== null) {
    window.clearInterval(interval);
  }
});
</script>
