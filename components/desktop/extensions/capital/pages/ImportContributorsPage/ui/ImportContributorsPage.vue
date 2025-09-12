<template lang="pug">
.q-pa-md
  q-card(v-if='!hasConfig')
    q-card-section
      .row.items-center.q-gutter-sm
        q-icon(name='upload_file', size='24px')
        div
          .text-h6 Импорт вкладчиков
          .text-subtitle2 Загрузка вкладчиков из CSV файла

    q-separator

    q-card-section
      template(v-if='parsedData.length === 0')
        CsvUploader(@parsed='onCsvParsed')

    template(
      v-if='parsedData.length > 0 && !isImporting && !isImportCompleted'
    )
      q-separator

      q-card-section
        .row.items-center.q-gutter-sm.q-mb-md
          q-icon(name='table_chart', size='20px')
          .text-subtitle1 Предварительный просмотр данных ({{ parsedData.length }} записей)

        q-table(
          :rows='parsedData',
          :columns='previewColumns',
          :loading='false',
          :pagination='{ rowsPerPage: 10 }',
          row-key='id',
          binary-state-sort
        )
          template(#body-cell-status='props')
            q-td
              q-chip(
                :color='getStatusColor(props.value)',
                text-color='white',
                dense
              ) {{ getStatusText(props.value) }}

      q-separator

      q-card-section
        .row.items-center.q-gutter-sm.q-mb-md
          q-icon(name='playlist_add_check', size='20px')
          .text-subtitle1 Импорт данных

        .row.justify-end.q-gutter-sm.q-mb-md
          q-btn(
            color='primary',
            :loading='isImporting',
            @click='startImport',
            label='Начать импорт',
            unelevated,
            icon='play_arrow'
          )

        template(v-if='importProgress > 0')
          .q-mt-md
            .text-body2.q-mb-sm Статистика
            .row.q-gutter-md
              .col-auto
                .text-weight-medium
                  q-icon.q-mr-xs(name='check_circle', color='positive')
                  | Успешно: {{ successCount }}
              .col-auto
                .text-weight-medium
                  q-icon.q-mr-xs(name='error', color='negative')
                  | Ошибок: {{ errorCount }}

    template(v-if='isImporting')
      q-separator

      q-card-section
        .row.items-center.q-gutter-sm.q-mb-md
          q-icon(name='sync', size='20px')
          .text-subtitle1 Выполняется импорт данных

        .q-mb-md
          .text-body2.q-mb-sm Прогресс импорта: {{ importProgress }}/{{ parsedData.length }} ({{ progressPercent }}%)
          q-linear-progress(
            :value='progressPercent / 100',
            color='primary',
            size='8px'
          )

        .row.justify-end.q-gutter-sm
          q-btn(
            color='negative',
            @click='stopImport',
            label='Остановить',
            flat,
            icon='stop'
          )

    template(v-if='importResults.length > 0 || isImportCompleted')
      q-separator

      q-card-section
        .row.items-center.q-gutter-sm.q-mb-md
          q-icon(name='table_chart', size='20px')
          .text-subtitle1 Результаты импорта

        ImportResultsTable(
          :items='importResults',
          :is-importing='isImporting',
          :current-index='currentImportIndex',
          @retry='retryImport',
          @retry-all-failed='retryAllFailed',
          @clear='clearAll'
        )
  q-card(v-else)
    q-card-section
      .row.items-center.q-gutter-sm
        q-icon(name='info', size='24px', color='info')
        div
          .text-h6 Конфигурация уже установлена
          .text-subtitle2 Импорт вкладчиков недоступен после установки конфигурации контракта.

    q-card-actions(align='center')
      q-btn(
        color='primary',
        to='/capital',
        icon='arrow_back',
        label='Вернуться к списку',
        unelevated
      )
</template>

<script setup lang="ts">
import { CsvUploader } from 'app/extensions/capital/widgets/CsvUploader';
import { ImportResultsTable } from 'app/extensions/capital/widgets/ImportResultsTable';
import {
  useCsvParser,
  type ICsvContributor,
} from 'app/extensions/capital/shared/lib/composables/useCsvParser';
import { useBatchImport } from 'app/extensions/capital/shared/lib/composables/useBatchImport';
import type { QTableProps } from 'quasar';
import { ref, computed, onMounted } from 'vue';
import { FailAlert, NotifyAlert, SuccessAlert } from 'src/shared/api';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { useSystemStore } from 'src/entities/System/model';

// Определение колонок для предварительного просмотра
const previewColumns: QTableProps['columns'] = [
  {
    name: 'username',
    label: 'Имя пользователя',
    align: 'left',
    field: 'username',
    sortable: true,
  },
  {
    name: 'contribution_amount',
    label: 'Сумма вклада',
    align: 'left',
    field: 'contribution_amount',
    sortable: true,
  },
  {
    name: 'contributor_hash',
    label: 'Хэш вкладчика',
    align: 'left',
    field: 'contributor_hash',
    sortable: true,
  },
  {
    name: 'memo',
    label: 'Примечание',
    align: 'left',
    field: 'memo',
    sortable: false,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'center',
    field: 'status',
    sortable: true,
  },
];

// Вспомогательные функции для отображения статуса
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'success':
      return 'positive';
    case 'error':
      return 'negative';
    default:
      return 'grey';
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'Ожидает';
    case 'success':
      return 'Успешно';
    case 'error':
      return 'Ошибка';
    default:
      return 'Неизвестно';
  }
};

// Stores
const configStore = useConfigStore();
const { info } = useSystemStore();

// Проверка наличия конфигурации
const hasConfig = computed(() => configStore.config !== null);

// Состояние импорта
const isImportCompleted = ref(false);

const { parsedData, clearData } = useCsvParser();
const {
  importProgress,
  isImporting,
  currentImportIndex,
  successCount,
  errorCount,
  progressPercent,
  importResults,
  startBatchImport,
  retryImport: batchRetryImport,
  stopImport: batchStopImport,
  resetImport,
} = useBatchImport();

// Загружаем конфигурацию при монтировании
onMounted(async () => {
  try {
    await configStore.loadConfig({ coopname: info.coopname });
  } catch (error) {
    console.error('Ошибка при загрузке конфигурации:', error);
  }
});

const onCsvParsed = (data: ICsvContributor[]) => {
  parsedData.value = data;
  resetImport();
};

const startImport = async () => {
  if (parsedData.value.length === 0) {
    NotifyAlert('Нет данных для импорта');
    return;
  }

  try {
    await startBatchImport(parsedData.value);
    isImportCompleted.value = true;
    if (successCount.value > 0 && errorCount.value === 0) {
      SuccessAlert(`Импорт завершен. Успешно: ${successCount.value}`);
    } else if (errorCount.value > 0) {
      SuccessAlert(
        `Импорт завершен. Успешно: ${successCount.value}, Ошибок: ${errorCount.value}`,
      );
    } else {
      SuccessAlert('Импорт завершен');
    }
  } catch (error) {
    FailAlert('Произошла ошибка при импорте');
  }
};

const stopImport = () => {
  batchStopImport();
  NotifyAlert('Импорт остановлен');
};

const retryImport = async (index: number) => {
  try {
    await batchRetryImport(index);
    if (importResults.value[index].status === 'success') {
      SuccessAlert('Запись успешно импортирована');
    }
  } catch (error) {
    // Ошибка уже обработана в batchRetryImport
  }
};

const retryAllFailed = async () => {
  const failedIndices = importResults.value
    .map((item, index) => (item.status === 'error' ? index : -1))
    .filter((index) => index !== -1);

  for (const index of failedIndices) {
    await retryImport(index);
  }

  NotifyAlert('Повторная попытка для всех ошибок завершена');
};

const clearAll = () => {
  clearData();
  resetImport();
  NotifyAlert('Данные очищены');
};
</script>

<style lang="scss" scoped>
// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .row.justify-end.q-gutter-sm {
    justify-content: center;

    .q-btn {
      width: 100%;
      margin-bottom: 8px;
    }
  }

  .row.q-gutter-md {
    justify-content: center;
  }
}
</style>
