<template lang="pug">
q-card(flat)
  q-table(
    :rows='timeStats?.items || []',
    :columns='columns',
    row-key='project_hash',
    :loading='loading',
    :pagination='pagination',
    @request='onRequest',
    flat,
    square,
    hide-header,
    hide-bottom,
    no-data-label='У вас нет вкладов времени по проектам'
  )
    template(#body='props')
      q-tr(
        :props='props',
        @click='handleProjectClick(props.row.project_hash)'
        style='cursor: pointer'
      )
        q-td(style='width: 55px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[props.row.project_hash] ? "expand_more" : "chevron_right"',
            @click.stop='handleToggleExpand(props.row.project_hash)'
          )
        q-td(
          style='cursor: pointer'
        )
          .title-container {{ props.row.project_name }}
        q-td.text-right
          .stats-info
            .stat-item
              q-chip(
                color='green',
                text-color='white',
                dense,
                :label='`${props.row.total_committed_hours}h`'
              )
              span.stat-label Зафиксировано
            .stat-item
              q-chip(
                color='orange',
                text-color='white',
                dense,
                :label='`${props.row.total_uncommitted_hours}h`'
              )
              span.stat-label Не зафиксировано

      // Слот для дополнительного контента проекта (TimeEntriesWidget)
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[props.row.project_hash]',
        :key='`e_${props.row.project_hash}`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          slot(name='project-content', :project='props.row')
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { useTimeStatsStore } from 'app/extensions/capital/entities/TimeStats/model';
import type { ITimeStatsPagination } from 'app/extensions/capital/entities/TimeStats/model/types';

const props = defineProps<{
  coopname?: string;
  expanded: Record<string, boolean>;
}>();

const emit = defineEmits<{
  toggleExpand: [projectHash: string];
  projectClick: [projectHash: string];
  dataLoaded: [projectHashes: string[]];
}>();

const { info } = useSystemStore();
const timeStatsStore = useTimeStatsStore();

const timeStats = ref<ITimeStatsPagination | null>(null);
const loading = ref(false);

// Пагинация
const pagination = ref({
  sortBy: 'project_name',
  sortOrder: 'ASC',
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0,
});

// Загрузка данных по статистике проектов
const loadTimeStats = async (paginationData?: any) => {
  const paginationToUse = paginationData || pagination.value;
  loading.value = true;

  try {
    const stats = await timeStatsStore.loadTimeStats({
      data: {
        coopname: props.coopname || info.coopname,
      },
      options: {
        page: paginationToUse.page,
        limit: paginationToUse.rowsPerPage,
        sortBy: paginationToUse.sortBy,
        sortOrder: paginationToUse.sortOrder,
      },
    });

    timeStats.value = stats;
    pagination.value.rowsNumber = stats.totalCount;

    // Эмитим событие загрузки данных с актуальными ключами проектов
    const projectHashes = stats.items.map(project => project.project_hash);
    emit('dataLoaded', projectHashes);
  } catch (error) {
    console.error('Ошибка при загрузке статистики времени:', error);
    FailAlert('Не удалось загрузить статистику времени');
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

  await loadTimeStats(pagination.value);
};

const handleToggleExpand = (projectHash: string) => {
  emit('toggleExpand', projectHash);
};

const handleProjectClick = (projectHash: string) => {
  emit('projectClick', projectHash);
};

// Загружаем данные при монтировании
onMounted(async () => {
  await loadTimeStats();
});

// Определяем столбцы таблицы
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'name',
    label: 'Проект',
    align: 'left' as const,
    field: 'project_name' as const,
    sortable: true,
  },
  {
    name: 'stats',
    label: 'Статистика',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
  },
];
</script>

<style lang="scss" scoped>
.title-container {
  font-weight: 500;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .stat-label {
    font-size: 0.75rem;
    color: #666;
    white-space: nowrap;
  }
}

.q-chip {
  font-weight: 500;
  font-size: 0.75rem;
}
</style>
