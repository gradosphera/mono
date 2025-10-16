<template lang="pug">
div
  q-card(flat)
    q-card-section(style='padding: 0px')
      q-table(
        :rows='issues?.items || []',
        :columns='columns',
        :pagination='{ rowsPerPage: 0 }',
        row-key='_id',
        :loading='loading',
        flat,
        square,
        hide-header,
        hide-bottom
      )
        template(#body-cell-id='props')
          q-td(:props='props' style="width: 30px")
            .text-caption.text-grey-7 {{ '#' + props.value }}

        template(#body-cell-priority='props')
          q-td(:props='props' style="width: 30px")
            q-icon(
              :name='getIssuePriorityIcon(props.value)',
              :color='getIssuePriorityColor(props.value)',
              size='sm'
            )

        template(#body-cell-title='props')
          q-td(:props='props' style="max-width: 200px; word-wrap: break-word; white-space: normal")
            .list-item-title(
              @click.stop='handleIssueClick(props.row)'
            )
              .text-body2.font-weight-medium {{ props.value }}
        template(#body-cell-status='props')
          q-td(:props='props' style="max-width: 75px")
            UpdateStatus(
              :model-value='props.value'
              :issue-hash='props.row.issue_hash'
              :readonly="!props.row.permissions.can_change_status"
              dense
              @click.stop
            )

        template(#body-cell-assignee='props')
          q-td(:props='props' style="max-width: 100px")

            SetCreatorButton(
              :dense='true'
              :issue='props.row'
              @click.stop
            )
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  type IIssue,
  useIssueStore,
} from 'app/extensions/capital/entities/Issue/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { SetCreatorButton } from '../../../features/Issue/SetCreator';
import { UpdateStatus } from '../../../features/Issue/UpdateIssue/ui/UpdateStatus';
import {
  getIssuePriorityIcon,
  getIssuePriorityColor,
} from 'app/extensions/capital/shared/lib';

const props = defineProps<{
  projectHash: string;
  statuses?: string[];
  priorities?: string[];
  master?: string;
}>();

const emit = defineEmits<{
  issueClick: [issue: IIssue];
}>();

useRouter();
const issueStore = useIssueStore();
const { info } = useSystemStore();

const loading = ref(false);

// Реактивная связь с store вместо локального копирования
const issues = computed(() => issueStore.getProjectIssues(props.projectHash));

// Определяем столбцы таблицы задач
const columns = [
  {
    name: 'id',
    label: 'ID',
    align: 'left' as const,
    field: 'id' as const,
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
    name: 'assignee',
    label: 'Исполнитель',
    align: 'center' as const,
    field: 'assignee' as const,
    sortable: false,
  },
];

// Загрузка задач компонента
const loadIssues = async () => {
  loading.value = true;
  try {
    const filter: any = {
      coopname: info.coopname,
      project_hash: props.projectHash,
    };

    // Добавляем дополнительные фильтры, если они переданы
    if (props.statuses?.length) {
      filter.statuses = props.statuses;
    }
    if (props.priorities?.length) {
      filter.priorities = props.priorities;
    }
    if (props.master) {
      filter.master = props.master;
    }

    await issueStore.loadIssues({
      filter,
      options: {
        page: 1,
        limit: 50, // Показываем все задачи компонента без пагинации
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    }, props.projectHash); // Передаем projectHash для сохранения в issuesByProject
  } catch (error) {
    console.error('Ошибка при загрузке задач компонента:', error);
    FailAlert('Не удалось загрузить задачи компонента');
  } finally {
    loading.value = false;
  }
};


// Обработчик клика по заголовку задачи
const handleIssueClick = (issue: IIssue) => {
  emit('issueClick', issue);
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
