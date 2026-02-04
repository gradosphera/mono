<template lang="pug">
q-card.result-preview-card(flat, v-if='showResult')
  q-card-section
    .row.justify-center.items-center.q-mb-sm
      .col-auto.q-pr-sm
        q-icon(name='description', size='md', color='orange')
      .col-auto
        .text-h6 Результат интеллектуальной деятельности

    .q-pa-sm
      template(v-if='loading')
        .text-center.q-pa-md
          q-spinner(color='primary', size='40px')
          .q-mt-sm Загрузка результата...

      template(v-else-if='error')
        q-banner.bg-negative.text-white.rounded-borders
          template(#avatar)
            q-icon(name='error', color='white')
          | {{ error }}

      template(v-else-if='result && result.data')
        q-card.q-mt-sm(flat, bordered)
          q-card-section.q-pa-none
            // Отображаем HTML-контент результата
            .result-viewer(v-html='result.data')

      template(v-else)
        q-banner.bg-info.text-white.rounded-borders
          template(#avatar)
            q-icon(name='info', color='white')
          | Текст результата ещё не сгенерирован. Нажмите кнопку "Пересчитать результат" для генерации.
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useResultStore } from 'app/extensions/capital/entities/Result/model';
import type { IResult } from 'app/extensions/capital/entities/Result/model';

interface Props {
  username: string;
  projectHash: string;
}

const props = defineProps<Props>();

const resultStore = useResultStore();
const result = ref<IResult | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showResult = ref(true);

// Загрузка результата по username и projectHash
const loadResult = async () => {
  if (!props.username || !props.projectHash) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    result.value = await resultStore.loadResultByFilters(props.username, props.projectHash);
  } catch (err: any) {
    console.error('Ошибка при загрузке результата:', err);
    error.value = err?.message || 'Не удалось загрузить результат';
  } finally {
    loading.value = false;
  }
};

// Загружаем результат при монтировании
onMounted(async () => {
  await loadResult();
});

// Перезагружаем при изменении username или projectHash
watch([() => props.username, () => props.projectHash], async () => {
  await loadResult();
});
</script>

<style lang="scss" scoped>
.result-preview-card {
  max-width: 100%;
  overflow: hidden;
}

.result-viewer {
  padding: 16px;
  overflow-x: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  // Ограничиваем ширину всех вложенных элементов
  :deep(*) {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  // Стили для HTML-контента результата наследуются из вложенного HTML
  :deep(.result-document) {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    max-width: 100%;
    margin: 0 auto;
  }

  :deep(.result-title) {
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  :deep(.result-section) {
    margin-top: 30px;
  }

  :deep(.result-description) {
    margin: 15px 0;
  }

  :deep(.requirements-list),
  :deep(.tasks-list) {
    margin: 10px 0;
    padding-left: 20px;
  }

  :deep(.requirements-list li),
  :deep(.tasks-list li) {
    margin: 5px 0;
  }

  :deep(.task-requirements) {
    margin: 10px 0;
    padding-left: 20px;
  }

  :deep(.task-requirements li) {
    margin: 3px 0;
  }

  :deep(.executed-tasks) {
    margin: 10px 0;
    padding-left: 20px;
  }

  :deep(.executed-tasks li) {
    margin: 5px 0;
  }

  :deep(.result-section-title) {
    margin-top: 30px;
  }

  :deep(.commit-link) {
    margin-bottom: 15px;
  }

  :deep(.commit-url) {
    color: #0066cc;
    text-decoration: none;
  }

  :deep(.commit-url:hover) {
    text-decoration: underline;
  }

  :deep(.diff-container) {
    font-family: monospace;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 16px;
    margin: 10px 0;
    overflow-x: auto;
    background-color: #f9f9f9;
    max-width: 100%;
    white-space: pre-wrap;
    word-break: break-all;
  }

  // Обработка длинных ссылок
  :deep(a) {
    word-break: break-all;
    overflow-wrap: break-word;
  }

  // Обработка предварительно отформатированного текста
  :deep(pre) {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  // Обработка кода
  :deep(code) {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  :deep(.diff-header) {
    font-weight: bold;
    margin: 0;
    padding: 2px 0;
    color: #333;
  }

  :deep(.diff-meta) {
    margin: 0;
    padding: 2px 0;
    color: #666;
  }

  :deep(.diff-hunk) {
    font-weight: bold;
    margin: 0;
    padding: 2px 0;
    color: #0066cc;
  }

  :deep(.diff-add) {
    margin: 0;
    padding: 2px 0;
    background-color: #e6ffec;
    color: #22863a;
  }

  :deep(.diff-del) {
    margin: 0;
    padding: 2px 0;
    background-color: #ffeef0;
    color: #cb2431;
  }

  :deep(.diff-normal) {
    margin: 0;
    padding: 2px 0;
  }
}
</style>
