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
    hide-header
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
          .title-container
            span.label Компонент:
            | {{ props.row.project_name }}
          .commit-button.mt-2
            CreateCommitButton(
              mini,
              :project-hash='props.row.project_hash',
              :disabled='props.row.total_uncommitted_hours === 0',
              :uncommitted-hours='props.row.total_uncommitted_hours'
            )
        q-td.text-right
          .stats-info
            .stat-item
              ColorCard(color='orange')
                .card-value {{ props.row.available_hours }}ч
                .card-label Доступно
            .stat-item
              ColorCard(color='red')
                .card-value {{ props.row.pending_hours }}ч
                .card-label В ожидании

            .stat-item
              ColorCard(color='green')
                .card-value {{ props.row.total_committed_hours }}ч
                .card-label Зафиксировано
            .stat-item
              ColorCard(color='blue')
                .card-value {{ props.row.total_committed_hours + props.row.total_uncommitted_hours }}ч
                .card-label Всего
      // Слот для дополнительного контента проекта (TimeEntriesWidget)
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[props.row.project_hash]',
        :key='`e_${props.row.project_hash}`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          slot(name='project-content', :project='props.row')

    template(#no-data)
      .text-center.text-grey-6.q-pa-md
        | У вас нет статистики времени по проектам
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { FailAlert } from 'src/shared/api';
import { useTimeStatsStore } from 'app/extensions/capital/entities/TimeStats/model';
import type { ITimeStatsPagination } from 'app/extensions/capital/entities/TimeStats/model/types';
import { useSystemStore } from 'src/entities/System/model';
import { CreateCommitButton } from 'app/extensions/capital/features/Commit/CreateCommit/ui';
import { ColorCard } from 'src/shared/ui/ColorCard/ui';

const props = defineProps<{
  coopname?: string;
  username?: string;
  expanded: Record<string, boolean>;
}>();

const { info } = useSystemStore();
const emit = defineEmits<{
  toggleExpand: [projectHash: string];
  projectClick: [projectHash: string];
  dataLoaded: [projectHashes: string[]];
}>();

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
        username: props.username,
        coopname: props.coopname || info.coopname,
      },
      options: {
        page: paginationToUse.page,
        limit: paginationToUse.rowsPerPage,
        sortBy: paginationToUse.sortBy,
        sortOrder: paginationToUse.sortOrder,
      },
    });
    console.log('status: ', stats)
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
    align: 'right' as const,
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

  .label {
    font-weight: 400;
    color: #666;
    margin-right: 4px;
  }
}

.stats-info {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;

  &.total {
    margin-left: 8px;
    padding-left: 8px;
    border-left: 1px solid #eee;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #666;
    white-space: nowrap;
  }

  :deep(.color-card) {
    margin-bottom: 0;
    padding: 6px 8px 2px 8px;
  }
}


.commit-button {
  display: flex;
  justify-content: flex-start;
  margin-top: 4px;
}
</style>
