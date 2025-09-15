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
        :rows='stories?.items || []',
        :columns='columns',
        row-key='hash',
        :loading='loading',
        :pagination='pagination',
        @request='onRequest',
        binary-state-sort,
        flat,
        square
      )
        template(#body-cell-title='props')
          q-td(:props='props')
            .row.items-center.q-gutter-sm
              q-icon(
                :name='getPriorityIcon(props.row.priority)',
                :color='getPriorityColor(props.row.priority)',
                size='sm'
              )
              div
                .text-body2.font-weight-medium {{ props.value }}
                .text-caption.text-grey-7 {{ props.row.description }}

        template(#body-cell-status='props')
          q-td(:props='props')
            q-chip(
              :color='getTaskStatusColor(props.value)',
              text-color='white',
              dense,
              :label='getTaskStatusLabel(props.value)'
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

        template(#body-cell-created_at='props')
          q-td(:props='props')
            div {{ formatDate(props.value) }}

    // Пагинация
    q-card-actions.q-mt-md(align='center')
      q-pagination(
        v-model='pagination.page',
        :max='Math.ceil((stories?.totalCount || 0) / pagination.rowsPerPage)',
        :max-pages='5',
        direction-links,
        boundary-links,
        @update:model-value='onRequest'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, markRaw } from 'vue';
import { useRoute } from 'vue-router';
import {
  type IProject,
  useProjectStore,
} from 'app/extensions/capital/entities/Project/model';
import {
  type IStoriesPagination,
  useStoryStore,
} from 'app/extensions/capital/entities/Story/model';
import { useSystemStore } from 'src/entities/System/model';
import { ProjectLifecycleWidget } from 'app/extensions/capital/widgets/ProjectLifecycleWidget';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { useRightDrawer } from 'src/shared/hooks/useRightDrawer';
import { FailAlert } from 'src/shared/api';
import { CreateIssueButton } from 'app/extensions/capital/features/Issue/CreateIssue';
import { Zeus } from '@coopenomics/sdk';

const route = useRoute();
const projectStore = useProjectStore();
const storyStore = useStoryStore();
const { info } = useSystemStore();

const loading = ref(false);
const project = ref<IProject | null | undefined>(null);
const stories = ref<IStoriesPagination | null>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.hash as string);

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
    label: 'Исполнитель',
    align: 'center' as const,
    field: 'assignee' as const,
    sortable: false,
  },
  {
    name: 'created_at',
    label: 'Создана',
    align: 'center' as const,
    field: 'created_at' as const,
    sortable: true,
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
          project: {
            hash: project.value.project_hash || '',
            status: project.value.status || '',
            name: project.value.title || '',
          },
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
const loadStories = async () => {
  loading.value = true;
  try {
    await storyStore.loadStories({
      data: {
        coopname: info.coopname,
        project_hash: projectHash.value,
      },
      pagination: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
      },
    });

    stories.value = storyStore.stories;
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

  await loadStories();
};

// Функция goBack больше не нужна - используется useBackButton

// Обработчик обновления проекта
const onProjectUpdated = async () => {
  await loadProject();
};

// Получение иконки приоритета
const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'arrow_upward';
    case 'medium':
      return 'remove';
    case 'low':
      return 'arrow_downward';
    default:
      return 'radio_button_unchecked';
  }
};

// Получение цвета приоритета
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'grey';
  }
};

// Получение цвета статуса задачи
const getTaskStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'grey';
    case 'in_progress':
      return 'blue';
    case 'in_review':
      return 'purple';
    case 'done':
      return 'green';
    default:
      return 'grey';
  }
};

// Получение текста статуса задачи
const getTaskStatusLabel = (status: string) => {
  switch (status) {
    case Zeus.IssueStatus.TODO:
      return 'К выполнению';
    case Zeus.IssueStatus.IN_PROGRESS:
      return 'В работе';
    case Zeus.IssueStatus.BACKLOG:
      return 'Бэклог';
    case Zeus.IssueStatus.DONE:
      return 'Выполнена';
    case Zeus.IssueStatus.CANCELED:
      return 'Отменена';
    default:
      return status;
  }
};

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Инициализация
onMounted(async () => {
  await loadProject();
  await loadStories();
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
