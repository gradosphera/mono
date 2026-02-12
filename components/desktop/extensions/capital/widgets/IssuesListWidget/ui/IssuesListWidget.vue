<template lang="pug">
div
  q-card(flat)
    q-card-section(style='padding: 0px')
      //- Полноэкранный режим с виртуальным скроллом (для отдельных страниц)
      .issues-scroll-area(
        v-if='!compact',
        style='height: calc(100vh - 55px); overflow-y: auto'
      )
        q-table(
          ref='tableRef',
          :rows='issues?.items || []',
          :columns='columns',
          row-key='_id',
          :pagination='pagination',
          :loading='onLoading',
          flat,
          square,
          hide-header,
          hide-pagination,
          virtual-scroll,
          @virtual-scroll='onScroll',
          :virtual-scroll-target='".issues-scroll-area"',
          :virtual-scroll-item-size='48',
          :virtual-scroll-sticky-size-start='48',
          :rows-per-page-options='[0]',
          no-data-label="Нет задач"
        )
          template(#body='props')
            q-tr(:props='props')
              q-td
                .row.items-center(style='padding-left: 12px; min-height: 48px')
                  .col-auto(style='width: 55px; flex-shrink: 0')
                  .col-auto(style='width: 100px; padding-left: 20px; flex-shrink: 0')
                    q-icon(name='task', size='xs').q-mr-xs
                    span.list-item-title(@click.stop='handleIssueClick(props.row)') {{ '#' + props.row.id }}
                  // Оценка задачи (80px)
                  .col-auto(style='width: 80px; padding-left: 20px')
                    Estimation(
                      :estimation='props.row.estimate'
                      size='xs'
                    )

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


                  .col-auto.ml-auto
                    .row.items-center.justify-end.q-gutter-xs
                      UpdateStatus(
                        :model-value='props.row.status'
                        :issue-hash='props.row.issue_hash'
                        :readonly="!props.row.permissions.can_change_status"
                        :allowed-transitions="props.row.permissions.allowed_status_transitions"
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

      //- Компактный режим без фиксированной высоты (для вложенного использования)
      div(v-else)
        q-table(
          :rows='issues?.items || []',
          :columns='columns',
          row-key='_id',
          :pagination='compactPagination',
          :loading='loading',
          flat,
          square,
          hide-header,
          hide-pagination,
          :rows-per-page-options='[0]',
          no-data-label="Нет задач"
        )
          template(#body='props')
            q-tr(:props='props')
              q-td
                .row.items-center(style='padding-left: 12px; min-height: 48px')
                  .col-auto(style='width: 55px; flex-shrink: 0')
                  .col-auto(style='width: 100px; padding-left: 20px; flex-shrink: 0')
                    q-icon(name='task', size='xs').q-mr-xs
                    span.list-item-title(@click.stop='handleIssueClick(props.row)') {{ '#' + props.row.id }}

                  // Оценка задачи (80px)
                  .col-auto(style='width: 80px; padding-left: 20px')

                    Estimation(
                      :estimation='props.row.estimate'
                      size='xs'
                    )
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



                  .col-auto.ml-auto
                    .row.items-center.justify-end.q-gutter-xs
                      UpdateStatus(
                        :model-value='props.row.status'
                        :issue-hash='props.row.issue_hash'
                        :readonly="!props.row.permissions.can_change_status"
                        :allowed-transitions="props.row.permissions.allowed_status_transitions"
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
import { ref, onMounted, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import {
  type IIssue,
  useIssueStore,
} from 'app/extensions/capital/entities/Issue/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { Estimation } from 'src/shared/ui';
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
  creators?: string[];
  compact?: boolean;
}>();

const emit = defineEmits<{
  issueClick: [issue: IIssue];
}>();

const issueStore = useIssueStore();
const { info } = useSystemStore();

const loading = ref(false);
const onLoading = ref(false);
const tableRef = ref(null);
const nextPage = ref(1);
const lastPage = ref(1);

// Пагинация для виртуального скролла (полноэкранный режим)
const pagination = ref({
  sortBy: '_created_at',
  descending: true,
  page: 1,
  rowsPerPage: 0,
  rowsNumber: 0,
});

// Пагинация для компактного режима (показываем все загруженные элементы)
const compactPagination = ref({
  sortBy: '_created_at',
  descending: true,
  page: 1,
  rowsPerPage: 0,
});

// Реактивная связь с store вместо локального копирования
const issues = computed(() => issueStore.getProjectIssues(props.projectHash));

// Заглушки для совместимости
const stopIssuesPoll = () => { return; };

// Следим за изменениями projectHash и перезагружаем задачи
watch(() => props.projectHash, async (newProjectHash, oldProjectHash) => {
  if (newProjectHash && newProjectHash !== oldProjectHash) {
    resetScrollState();
    await loadIssues(1, false);
  }
});

// Следим за изменениями фильтров и сбрасываем состояние
watch([() => props.statuses, () => props.priorities, () => props.creators, () => props.master], () => {
  resetScrollState();
  loadIssues(1, false);
}, { deep: true });

// Функция обработки виртуального скролла
const onScroll = ({ to, ref }) => {
  if (issues.value) {
    const lastIndex = issues.value.items.length - 1;

    if (
      onLoading.value !== true &&
      nextPage.value <= lastPage.value &&
      to === lastIndex
    ) {
      onLoading.value = true;

      setTimeout(() => {
        loadIssues(nextPage.value, true).then(() => {
          nextPage.value++;
          nextTick(() => {
            ref.refresh(); // Обновляем виртуальный скролл после загрузки
            onLoading.value = false;
          });
        });
      }, 500); // Имитируем задержку загрузки
    }
  }
};

// Функция сброса состояния бесконечного скролла
const resetScrollState = () => {
  nextPage.value = 1;
  lastPage.value = 1;
  pagination.value.rowsNumber = 0;
};

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
const loadIssues = async (page = 1, append = false) => {
  if (!append) {
    loading.value = true;
  } else {
    onLoading.value = true;
  }

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
    if (props.creators?.length) {
      filter.creators = props.creators;
    }
    if (props.master) {
      filter.master = props.master;
    }

    await issueStore.loadIssues({
      filter,
      options: {
        page,
        limit: props.compact ? 50 : 5, // В компактном режиме загружаем больше, в полноэкранном - постранично
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    }, props.projectHash, append); // Передаем projectHash и флаг append для объединения результатов

    if (issues.value) {
      lastPage.value = issues.value.totalPages || 1;
      pagination.value.rowsNumber = issues.value.totalCount;

      if (!append) {
        nextPage.value = 2;
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке задач компонента:', error);
    FailAlert('Не удалось загрузить задачи компонента');
  } finally {
    loading.value = false;
    onLoading.value = false;
  }
};


// Обработчик клика по заголовку задачи
const handleIssueClick = (issue: IIssue) => {
  emit('issueClick', issue);
};

// Инициализация
onMounted(async () => {
  await loadIssues(1, false);

  // Poll обновления отключены для бесконечного скролла
  // startIssuesPoll();
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
