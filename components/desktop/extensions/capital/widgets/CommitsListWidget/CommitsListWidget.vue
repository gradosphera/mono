<template lang="pug">
q-card(flat)
  // Лоадер загрузки коммитов
  WindowLoader(v-if='loading', text='')

  q-table(
    :rows='commits?.items || []',
    :columns='columns',
    row-key='commit_hash',
    :pagination='pagination',
    @request='onRequest',
    flat,
    square,
    :no-data-label='"Нет коммитов"'
  )
    template(#body='props')
      q-tr(
        :props='props',
        @click='handleCommitClick(props.row.commit_hash)',
        style='cursor: pointer'
      )
        q-td(style='width: 55px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[props.row.commit_hash] ? "expand_more" : "chevron_right"',
            @click.stop='handleToggleExpand(props.row.commit_hash)'
          )
        q-td(style='width: 150px')
          .text-grey-7 {{ formatDate(props.row.created_at) }}

        q-td(
          style='cursor: pointer'
        )
          .row.items-center.q-gutter-xs
            q-avatar(size='32px')
              q-icon(name='person', size='sm')
            .commit-info
              .commit-hash.text-grey-7 {{ truncateHash(props.row.commit_hash) }}
              .commit-author {{ props.row.username || 'Неизвестный пользователь' }}

        q-td
          q-chip(
            :color='getStatusColor(props.row.status)',
            :text-color="'white'",
            dense
          ) {{ getStatusLabel(props.row.status) }}

        q-td(style='width: 120px')
          .text-grey-7 {{ props.row.id || '—' }}

        q-td
          .row.items-center.q-gutter-sm
            ApproveCommitButton(
              v-if='props.row.status === Zeus.CommitStatus.CREATED'
              :commit-hash='props.row.commit_hash'
              mini
            )

            DeclineCommitButton(
              v-if='props.row.status === Zeus.CommitStatus.CREATED'
              :commit-hash='props.row.commit_hash'
              mini
            )

      // Разворачиваемый контент с деталями коммита
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[props.row.commit_hash]',
        :key='`e_${props.row.commit_hash}`'
      )
        q-td(colspan='6', style='padding: 16px;')
          .commit-details
            .row.q-gutter-md
              .col
                .text-subtitle2.text-grey-7 Пользователь:
                .text-body2 {{ props.row.username || 'Неизвестный пользователь' }}
              .col
                .text-subtitle2.text-grey-7 Дата:
                .text-body2 {{ formatDate(props.row.created_at) }}
              .col
                .text-subtitle2.text-grey-7 ID в блокчейне:
                .text-body2 {{ props.row.id || 'Не указан' }}

            .q-mt-md
              .row.q-gutter-md
                .col
                  .text-subtitle2.text-grey-7 Статус:
                  q-chip(
                    :color='getStatusColor(props.row.status)',
                    :text-color="'white'",
                    dense
                  ) {{ getStatusLabel(props.row.status) }}
                .col(v-if='props.row.project_hash')
                  .text-subtitle2.text-grey-7 Проект:
                  .text-body2 {{ truncateHash(props.row.project_hash) }}
                .col(v-if='props.row.blockchain_status')
                  .text-subtitle2.text-grey-7 Статус в блокчейне:
                  .text-body2 {{ props.row.blockchain_status }}
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { QTableProps } from 'quasar';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useCommitStore } from 'app/extensions/capital/entities/Commit/model';
import type { IGetCommitsFilter } from 'app/extensions/capital/entities/Commit/model';
import { ApproveCommitButton } from 'app/extensions/capital/features/Commit/ApproveCommit';
import { DeclineCommitButton } from 'app/extensions/capital/features/Commit/DeclineCommit';
import { Zeus } from '@coopenomics/sdk';

const props = defineProps<{
  filter?: IGetCommitsFilter;
  expanded?: Record<string, boolean>;
}>();

const emit = defineEmits<{
  toggleExpand: [commitHash: string];
  commitClick: [commitHash: string];
  dataLoaded: [commitHashes: string[]];
}>();

const { info } = useSystemStore();
const commitStore = useCommitStore();

const commits = ref<any>(null);
const loading = ref(false);
const expanded = ref<Record<string, boolean>>(props.expanded || {});

// Пагинация
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0,
});

// Загрузка коммитов
const loadCommits = async (paginationData?: any) => {
  const paginationToUse = paginationData || pagination.value;
  loading.value = true;

  try {
    const filter: IGetCommitsFilter = {
      coopname: info.coopname,
      ...props.filter,
    };

    await commitStore.loadCommits({
      filter,
      options: {
        page: paginationToUse.page,
        limit: paginationToUse.rowsPerPage,
        sortBy: paginationToUse.sortBy,
        sortOrder: paginationToUse.descending ? 'DESC' : 'ASC',
      },
    });

    commits.value = commitStore.commits;
    pagination.value.rowsNumber = commitStore.commits?.totalCount || 0;

    // Эмитим событие загрузки данных с актуальными ключами коммитов
    const commitHashes = commitStore.commits?.items?.map(
      (commit: any) => commit.commit_hash,
    ) || [];

    emit('dataLoaded', commitHashes);
  } catch (error) {
    console.error('Ошибка при загрузке коммитов:', error);
    FailAlert('Не удалось загрузить список коммитов');
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
  pagination.value.descending = descending;

  await loadCommits(pagination.value);
};

const handleToggleExpand = (commitHash: string) => {
  expanded.value[commitHash] = !expanded.value[commitHash];
  emit('toggleExpand', commitHash);
};

const handleCommitClick = (commitHash: string) => {
  emit('commitClick', commitHash);
};

// Вспомогательные функции
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncateHash = (hash: string) => {
  if (!hash) return '';
  return hash.substring(0, 8);
};

// Функции для работы со статусами
const getStatusColor = (status: string) => {
  switch (status) {
    case Zeus.CommitStatus.CREATED:
      return 'orange';
    case Zeus.CommitStatus.APPROVED:
      return 'green';
    case Zeus.CommitStatus.DECLINED:
      return 'red';
    case Zeus.CommitStatus.UNDEFINED:
      return 'grey';
    default:
      return 'grey';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case Zeus.CommitStatus.CREATED:
      return 'Ожидает';
    case Zeus.CommitStatus.APPROVED:
      return 'Одобрен';
    case Zeus.CommitStatus.DECLINED:
      return 'Отклонен';
    case Zeus.CommitStatus.UNDEFINED:
      return 'Не определен';
    default:
      return status;
  }
};

// Загружаем данные при монтировании
onMounted(async () => {
  await loadCommits();
});

// Определяем столбцы таблицы
const columns: QTableProps['columns'] = [
  {
    name: 'expand',
    label: '',
    align: 'center' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'date',
    label: 'Дата',
    align: 'left' as const,
    field: 'created_at' as const,
    sortable: true,
  },
  {
    name: 'commit',
    label: 'Коммит',
    align: 'left' as const,
    field: 'commit_hash' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'left' as const,
    field: 'status' as const,
    sortable: true,
  },
  {
    name: 'id',
    label: 'ID',
    align: 'left' as const,
    field: 'id' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Действия',
    align: 'center' as const,
    field: '' as const,
    sortable: false,
  },
];
</script>

<style lang="scss" scoped>
.commit-info {
  .commit-hash {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }

  .commit-author {
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.commit-details {
  .text-subtitle2 {
    margin-bottom: 4px;
  }

  .text-body2 {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }
}
</style>
