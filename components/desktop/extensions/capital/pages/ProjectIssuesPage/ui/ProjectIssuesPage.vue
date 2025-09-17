<template lang="pug">
div
  // Заголовок с информацией о проекте
  q-card.q-mb-md(flat)
    q-card-section
      .row.items-center.q-gutter-sm
        q-icon(name='task', size='24px')
        div
          .text-h6 {{ project?.title || 'Загрузка...' }}

    q-card-section
      .row.items-center.q-gutter-md
        .col
          .text-body2 Описание: {{ project?.description || '—' }}

  // Таблица задач
  q-card(flat)
    q-card-section
      .row.items-center.q-gutter-sm.q-mb-md
        q-icon(name='list_alt', size='20px')
        .text-h6 Задачи

      q-table(
        :rows='issues?.items || []',
        :columns='columns',
        row-key='_id',
        :loading='loading',
        :pagination='pagination',
        @request='onRequest',
        @row-click='onRowClick',
        binary-state-sort,
        flat,
        square,
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

    // Пагинация
    q-card-actions.q-mt-md(align='center')
      q-pagination(
        v-model='pagination.page',
        :max='Math.ceil((issues?.totalCount || 0) / pagination.rowsPerPage)',
        :max-pages='5',
        direction-links,
        boundary-links,
        @update:model-value='onRequest'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, markRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  type IProject,
  useProjectStore,
} from 'app/extensions/capital/entities/Project/model';
import {
  type IIssue,
  type IIssuesPagination,
  useIssueStore,
} from 'app/extensions/capital/entities/Issue/model';
import { useSystemStore } from 'src/entities/System/model';
import { ProjectLifecycleWidget } from 'app/extensions/capital/widgets/ProjectLifecycleWidget';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { useRightDrawer } from 'src/shared/hooks/useRightDrawer';
import { FailAlert } from 'src/shared/api';
import { CreateIssueButton } from 'app/extensions/capital/features/Issue/CreateIssue';
import 'src/shared/ui/TitleStyles';
import {
  getIssueStatusColor,
  getIssueStatusLabel,
  getIssuePriorityIcon,
  getIssuePriorityColor,
  getIssuePriorityLabel,
} from 'app/extensions/capital/shared/lib';

const route = useRoute();
const projectStore = useProjectStore();
const issueStore = useIssueStore();
const { info } = useSystemStore();

const loading = ref(false);
const project = ref<IProject | null | undefined>(null);
const issues = ref<IIssuesPagination | null>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);
const router = useRouter();
// Настраиваем кнопку "Назад"
useBackButton({
  text: 'К проектам',
  routeName: 'projects',
  componentId: 'project-tasks-' + projectHash.value,
});

// Регистрируем кнопку создания задачи в header
const { registerAction: registerHeaderAction } = useHeaderActions();

// Регистрируем контент в правом drawer
const { registerAction: registerRightDrawerAction } = useRightDrawer();

// Регистрируем действие в header
onMounted(() => {
  registerHeaderAction({
    id: 'create-task-' + projectHash.value,
    component: markRaw(CreateIssueButton),
    order: 1,
  });
});

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
    label: 'Создатель',
    align: 'center' as const,
    field: 'assignee' as const,
    sortable: false,
  },
  {
    name: 'created_by',
    label: 'Предложивший',
    align: 'center' as const,
    field: 'created_by' as const,
    sortable: false,
  },
];

// Пагинация
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Загрузка проекта
const loadProject = async () => {
  try {
    await projectStore.loadProject({
      hash: projectHash.value,
    });
    project.value = projectStore.project;

    // Регистрируем ProjectLifecycleWidget в правом drawer
    if (project.value) {
      registerRightDrawerAction({
        id: 'project-lifecycle-' + projectHash.value,
        component: ProjectLifecycleWidget,
        props: {
          project,
          onProjectUpdated: onProjectUpdated,
        },
        order: 1,
      });
    }
  } catch (error) {
    console.error('Ошибка при загрузке проекта:', error);
    FailAlert('Не удалось загрузить проект');
  }
};

// Загрузка задач проекта
const loadIssues = async () => {
  loading.value = true;
  try {
    await issueStore.loadIssues({
      filter: {
        coopname: info.coopname,
        project_hash: projectHash.value,
      },
      options: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        sortOrder: pagination.value.descending ? 'DESC' : 'ASC',
      },
    });

    issues.value = issueStore.issues;
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
    FailAlert('Не удалось загрузить задачи проекта');
  } finally {
    loading.value = false;
  }
};

// Обработчик запросов пагинации и сортировки
const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  await loadIssues();
};

// Функция goBack больше не нужна - используется useBackButton

// Обработчик обновления проекта
const onProjectUpdated = async () => {
  await loadProject();
};

// Обработчик клика по строке задачи
const onRowClick = (evt: Event, row: IIssue) => {
  router.push({
    name: 'project-issue',
    params: {
      project_hash: projectHash.value,
      issue_hash: row.issue_hash,
    },
  });
};

// Watcher для отслеживания изменения projectHash
watch(projectHash, async (newHash, oldHash) => {
  if (newHash && newHash !== oldHash) {
    // Сбрасываем пагинацию при переходе к другому проекту
    pagination.value.page = 1;
    pagination.value.sortBy = 'created_at';
    pagination.value.descending = true;

    await loadProject();
    await loadIssues();
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
  await loadIssues();
});
</script>

<style lang="scss" scoped>
.q-table {
  border-radius: 8px;

  .q-td {
    padding: 12px;
  }
}

.q-chip {
  font-weight: 500;
}

.text-h6 {
  margin-bottom: 4px;
}
</style>
