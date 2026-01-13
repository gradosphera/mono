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
        hide-pagination
        no-data-label="Нет задач"
      )
        template(#body='props')
          q-tr(
            :props='props'
          )
            q-td
              .row.items-center(style='padding-left: 12px; min-height: 48px')
                // Пустое пространство для выравнивания с проектами/компонентами (55px)
                .col-auto(style='width: 55px; flex-shrink: 0')

                // ID с иконкой (100px + отступ 40px)
                .col-auto(style='width: 100px; padding-left: 20px; flex-shrink: 0')
                  q-icon(name='task', size='xs').q-mr-xs
                  span.list-item-title(
                    @click.stop='handleIssueClick(props.row)'
                  ) {{ '#' + props.row.id }}

                // Title с приоритетом (400px + отступ 40px)
                .col(style='width: 400px; padding-left: 40px')
                  .list-item-title(
                    @click.stop='handleIssueClick(props.row)'
                    style='display: inline-block; vertical-align: top; word-wrap: break-word; white-space: normal'
                  )
                    q-icon(
                      :name='getIssuePriorityIcon(props.row.priority)',
                      :color='getIssuePriorityColor(props.row.priority)',
                      size='xs'
                    ).q-mr-sm
                    span.text-body2.font-weight-medium {{ props.row.title }}

                // Actions (статус + исполнитель + кнопка перехода) - выравнивание по правому краю
                .col-auto.ml-auto
                  .row.items-center.justify-end.q-gutter-xs
                    UpdateStatus(
                      :model-value='props.row.status'
                      :issue-hash='props.row.issue_hash'
                      :readonly="!props.row.permissions.can_change_status"
                      dense
                      @click.stop
                    )

                    SetCreatorButton(
                      :dense='true'
                      :issue='props.row'
                      :permissions='props.row.permissions'
                      @click.stop
                      style="max-width: 250px;"
                    )

</template>
<script lang="ts" setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import {
  type IIssue,
  useIssueStore,
} from 'app/extensions/capital/entities/Issue/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
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

const issueStore = useIssueStore();
const { info } = useSystemStore();

const loading = ref(false);

// Реактивная связь с store вместо локального копирования
const issues = computed(() => issueStore.getProjectIssues(props.projectHash));

/**
 * Функция для перезагрузки задач компонента
 * Используется для poll обновлений
 */
const reloadIssues = async () => {
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
    }, props.projectHash);
  } catch (error) {
    console.warn('Ошибка при перезагрузке задач компонента в poll:', error);
  }
};

// Настраиваем poll обновление данных задач
const { start: startIssuesPoll, stop: stopIssuesPoll } = useDataPoller(
  reloadIssues,
  { interval: POLL_INTERVALS.SLOW, immediate: false }
);

// Следим за изменениями projectHash и перезагружаем задачи
watch(() => props.projectHash, async (newProjectHash, oldProjectHash) => {
  if (newProjectHash && newProjectHash !== oldProjectHash) {
    await loadIssues();
  }
});

// Определяем столбцы таблицы задач
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'id',
    label: 'ID',
    align: 'left' as const,
    field: 'id' as const,
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
    align: 'right' as const,
    field: 'status' as const,
    sortable: true,
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

  // Запускаем poll обновление данных задач
  startIssuesPoll();
});

// Останавливаем poll при размонтировании
onBeforeUnmount(() => {
  stopIssuesPoll();
});
</script>

<style lang="scss" scoped>
.q-table {
  tr {
    min-height: 48px;
  }

  .q-td {
    padding: 0; // Убираем padding таблицы, так как теперь используем внутренний padding
  }
}

.q-chip {
  font-weight: 500;
}

// Импорт глобального стиля для подсветки
:deep(.list-item-title) {
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--q-accent);
  }
}
</style>
