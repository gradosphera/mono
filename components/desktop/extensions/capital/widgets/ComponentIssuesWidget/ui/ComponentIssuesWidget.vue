<template lang="pug">
div
  q-card(flat)
    q-card-section(style='padding: 0px')
      q-table(
        :rows='issues?.items || []',
        :columns='columns',
        row-key='_id',
        :loading='loading',
        @row-click='onRowClick',
        flat,
        square,
        hide-header,
        hide-bottom,
        style='cursor: pointer'
      )
        template(#body-cell-title='props')
          q-td(:props='props')
            .row.items-center.q-gutter-sm
              q-icon(
                :name='getIssuePriorityIcon(props.row.priority)',
                :color='getIssuePriorityColor(props.row.priority)',
                size='sm'
              )
              .title-container
                .text-body2.font-weight-medium {{ props.value }}

        template(#body-cell-status='props')
          q-td(:props='props')
            q-chip(
              :color='getIssueStatusColor(props.value)',
              text-color='white',
              dense,
              :label='getIssueStatusLabel(props.value)'
            )

        template(#body-cell-priority='props')
          q-td(:props='props')
            q-chip(
              :color='getIssuePriorityColor(props.value)',
              text-color='white',
              dense,
              :label='getIssuePriorityLabel(props.value)'
            )

        template(#body-cell-assignee='props')
          q-td(:props='props')
            q-chip(
              v-if='props.value',
              color='blue-grey-2',
              text-color='blue-grey-9',
              dense,
              :label='props.value'
            )
            span.text-grey-5(v-else) Не назначен

        template(#body-cell-created_by='props')
          q-td(:props='props')
            q-chip(
              v-if='props.value',
              color='blue-grey-2',
              text-color='blue-grey-9',
              dense,
              :label='props.value'
            )
            span.text-grey-5(v-else) Не указан
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  type IIssue,
  type IIssuesPagination,
  useIssueStore,
} from 'app/extensions/capital/entities/Issue/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import {
  getIssueStatusColor,
  getIssueStatusLabel,
  getIssuePriorityIcon,
  getIssuePriorityColor,
  getIssuePriorityLabel,
} from 'app/extensions/capital/shared/lib';

const props = defineProps<{
  projectHash: string;
}>();

const emit = defineEmits<{
  issueClick: [issue: IIssue];
}>();

useRouter();
const issueStore = useIssueStore();
const { info } = useSystemStore();

const loading = ref(false);
const issues = ref<IIssuesPagination | null>(null);

// Определяем столбцы таблицы задач
const columns = [
  {
    name: 'title',
    label: 'Задача',
    align: 'left' as const,
    field: 'title' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'center' as const,
    field: 'status' as const,
    sortable: true,
  },
  {
    name: 'priority',
    label: 'Приоритет',
    align: 'center' as const,
    field: 'priority' as const,
    sortable: true,
  },
  {
    name: 'assignee',
    label: 'Исполнитель',
    align: 'center' as const,
    field: 'assignee' as const,
    sortable: false,
  },
  {
    name: 'created_by',
    label: 'Создатель',
    align: 'center' as const,
    field: 'created_by' as const,
    sortable: false,
  },
];

// Загрузка задач компонента
const loadIssues = async () => {
  loading.value = true;
  try {
    await issueStore.loadIssues({
      filter: {
        coopname: info.coopname,
        project_hash: props.projectHash,
      },
      options: {
        page: 1,
        limit: 50, // Показываем все задачи компонента без пагинации
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    });

    issues.value = issueStore.issues;
  } catch (error) {
    console.error('Ошибка при загрузке задач компонента:', error);
    FailAlert('Не удалось загрузить задачи компонента');
  } finally {
    loading.value = false;
  }
};

// Обработчик клика по строке задачи
const onRowClick = (evt: Event, row: IIssue) => {
  emit('issueClick', row);
};

// Инициализация
onMounted(async () => {
  await loadIssues();
});
</script>

<style lang="scss" scoped>
.q-table {
  .q-td {
    padding: 8px 12px;
  }
}

.q-chip {
  font-weight: 500;
}
</style>
