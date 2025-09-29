<template lang="pug">
q-card(flat, style='margin-left: 20px; margin-top: 8px;')
  q-table(
    :rows='timeEntries?.items || []',
    :columns='columns',
    row-key='_id',
    :loading='loading',
    flat,
    square,
    hide-header,
    hide-bottom,
    :pagination='pagination',
    @request='onRequest'
  )
    template(#body='props')
      q-tr(:props='props')
        q-td {{ formatDate(props.row.date) }}
        q-td {{ props.row.hours }}h
        q-td
          q-chip(
            :color='props.row.is_committed ? "green" : "orange"',
            text-color='white',
            dense,
            :label='props.row.is_committed ? "Зафиксировано" : "Не зафиксировано"'
          )
        q-td
          .commit-info(v-if='props.row.commit_hash')
            q-chip(
              color='blue',
              text-color='white',
              dense,
              size='sm',
              :label='`Commit: ${props.row.commit_hash.substring(0, 8)}`'
            )
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { useTimeEntriesStore } from 'app/extensions/capital/entities/TimeEntries/model';

const props = defineProps<{
  issueHash: string;
  coopname?: string;
  username?: string;
}>();

const { info } = useSystemStore();
const timeEntriesStore = useTimeEntriesStore();

const timeEntries = ref<any>(null);
const loading = ref(false);

// Определяем столбцы таблицы
const columns = [
  {
    name: 'date',
    label: 'Дата',
    align: 'left' as const,
    field: 'date' as const,
    sortable: true,
  },
  {
    name: 'hours',
    label: 'Часы',
    align: 'center' as const,
    field: 'hours' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'center' as const,
    field: 'is_committed' as const,
    sortable: true,
  },
  {
    name: 'commit',
    label: 'Коммит',
    align: 'left' as const,
    field: 'commit_hash' as const,
    sortable: false,
  },
];

// Пагинация
const pagination = ref({
  sortBy: '_created_at',
  sortOrder: 'DESC',
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

// Загрузка данных по записям времени
const loadTimeEntries = async (paginationData?: any) => {
  if (!props.issueHash) return;

  const paginationToUse = paginationData || pagination.value;
  loading.value = true;

  try {
    const entries = await timeEntriesStore.loadTimeEntries({
      filter: {
        coopname: props.coopname || info.coopname,
        issue_hash: props.issueHash,
        username: props.username,
      },
      options: {
        page: paginationToUse.page,
        limit: paginationToUse.rowsPerPage,
        sortBy: paginationToUse.sortBy,
        sortOrder: paginationToUse.sortOrder,
      },
    });

    timeEntries.value = entries;
    pagination.value.rowsNumber = entries.totalCount;
  } catch (error) {
    console.error('Ошибка при загрузке записей времени:', error);
    FailAlert('Не удалось загрузить записи времени');
  } finally {
    loading.value = false;
  }
};

// Обработчик запросов пагинации и сортировки
const onRequest = async (requestProps: any) => {
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.sortOrder = descending ? 'DESC' : 'ASC';

  await loadTimeEntries(pagination.value);
};

// Загружаем данные при монтировании и изменении issueHash
onMounted(() => {
  loadTimeEntries();
});

watch(() => props.issueHash, () => {
  // Сбрасываем пагинацию при изменении issue
  pagination.value.page = 1;
  loadTimeEntries();
});
</script>

<style lang="scss" scoped>

.commit-info {
  max-width: 200px;
}

.q-chip {
  font-weight: 500;
  font-size: 0.7rem;
}
</style>
