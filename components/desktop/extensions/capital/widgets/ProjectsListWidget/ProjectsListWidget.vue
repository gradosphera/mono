<template lang="pug">
q-card(flat)
  // Лоадер загрузки проектов
  WindowLoader(v-if='loading', text='')

  q-table(
    :rows='projects?.items || []',
    :columns='columns',
    row-key='project_hash',
    :pagination='pagination',
    @request='onRequest',
    flat,
    square,
    hide-header,
    hide-pagination,
    :no-data-label='hasFiltersApplied ? "Нет результатов по фильтрам" : "Нет проектов"'
  )
    template(#body='props')
      q-tr(
        :props='props'
      )
        q-td
          .row.items-center(style='padding: 12px; min-height: 48px')
            // Кнопка раскрытия (55px)
            .col-auto(style='width: 55px; flex-shrink: 0')
              q-btn(
                size='sm',
                color='primary',
                dense,
                round,
                :icon='expanded[props.row.project_hash] ? "expand_more" : "chevron_right"',
                @click.stop='handleToggleExpand(props.row.project_hash)'
              )

            // ID с иконкой (100px + отступ 0px)
            .col-auto(style='width: 100px; padding-left: 0px; flex-shrink: 0')
              q-icon(name='work', size='xs').q-mr-xs
              span.list-item-title(
                v-if='props.row.prefix'
                @click.stop='handleOpenProject(props.row.project_hash)'
              ) {{ '#' + props.row.prefix }}

            // Title со статусом (400px + отступ 0px)
            .col(style='width: 400px; padding-left: 0px')
              .list-item-title(
                @click.stop='handleOpenProject(props.row.project_hash)'
                style='display: inline-block; vertical-align: top; word-wrap: break-word; white-space: normal'
              )
                q-icon(
                  :name='getProjectStatusIcon(props.row.status)',
                  :color='getProjectStatusDotColor(props.row.status)',
                  size='xs'
                ).q-mr-sm
                span {{ props.row.title }}

            // Actions - CreateComponentButton и кнопка перехода (120px, выравнивание по правому краю)
            .col-auto.ml-auto(style='width: 120px')
              .row.items-center.justify-end.q-gutter-xs
                CreateComponentButton(
                  :project='props.row',
                  :mini='true',
                  @click.stop
                )

                q-btn(
                  size='xs',
                  flat,
                  icon='arrow_forward',
                  @click.stop='handleOpenProject(props.row.project_hash)'
                )

      // Слот для дополнительного контента проекта (ComponentsListWidget)
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[props.row.project_hash]',
        :key='`e_${props.row.project_hash}`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          slot(name='project-content', :project='props.row')
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { CreateComponentButton } from 'app/extensions/capital/features/Project/CreateComponent';
import { getProjectStatusIcon, getProjectStatusDotColor } from 'app/extensions/capital/shared/lib/projectStatus';

const props = defineProps<{
  coopname?: string;
  expanded: Record<string, boolean>;

  statuses?: string[];
  priorities?: string[];
  hasIssuesWithStatuses?: string[];
  hasIssuesWithPriorities?: string[];
  master?: string;
}>();

const { info } = useSystemStore();
const emit = defineEmits<{
  toggleExpand: [projectHash: string];
  dataLoaded: [projectHashes: string[], totalComponents?: number];
  openProject: [projectHash: string];
  paginationChanged: [pagination: { page: number; rowsPerPage: number; sortBy: string; descending: boolean }];
}>();

const projectStore = useProjectStore();

const projects = ref<any>(null);
const loading = ref(false);

// Следим за изменениями в projectStore и обновляем локальные данные
watch(() => projectStore.projects, (newProjects) => {
  if (newProjects) {
    projects.value = newProjects;

    // Обновляем пагинацию
    pagination.value.rowsNumber = newProjects.totalCount;

    // Эмитим событие загрузки данных с актуальными ключами проектов
    const projectHashes = newProjects.items.map(
      (project: any) => project.project_hash,
    );

    // Подсчитываем общее количество компонентов
    const totalComponents = newProjects.items.reduce(
      (sum: number, project: any) => {
        return sum + (project.components?.length || 0);
      },
      0,
    );

    emit('dataLoaded', projectHashes, totalComponents);
  }
}, { deep: true });

// Проверяем, применены ли фильтры
const hasFiltersApplied = computed(() => {
  return (
    (props.statuses?.length ?? 0) > 0 ||
    (props.priorities?.length ?? 0) > 0 ||
    (props.hasIssuesWithStatuses?.length ?? 0) > 0 ||
    (props.hasIssuesWithPriorities?.length ?? 0) > 0 ||
    !!props.master
  );
});

// Пагинация
const pagination = ref({
  sortBy: '_created_at',
  descending: true,
  page: 1,
  rowsPerPage: 0,
  rowsNumber: 0,
});

// Загрузка проектов
const loadProjects = async (paginationData?: any) => {
  const paginationToUse = paginationData || pagination.value;
  loading.value = true;

  try {
    const filter: any = {
      coopname: props.coopname || info.coopname,
      parent_hash: '',
    };

    // Добавляем дополнительные фильтры, если они переданы
    if (props.statuses?.length) {
      filter.statuses = props.statuses;
    }
    if (props.priorities?.length) {
      filter.priorities = props.priorities;
    }
    if (props.hasIssuesWithStatuses?.length) {
      filter.has_issues_with_statuses = props.hasIssuesWithStatuses;
    }
    if (props.hasIssuesWithPriorities?.length) {
      filter.has_issues_with_priorities = props.hasIssuesWithPriorities;
    }
    if (props.master) {
      filter.master = props.master;
    }

    await projectStore.loadProjects({
      filter,
      pagination: {
        page: paginationToUse.page,
        limit: paginationToUse.rowsPerPage,
        sortBy: paginationToUse.sortBy,
        descending: paginationToUse.descending,
      },
    });

    projects.value = projectStore.projects;
    pagination.value.rowsNumber = projectStore.projects.totalCount;

    // Эмитим событие загрузки данных с актуальными ключами проектов
    const projectHashes = projectStore.projects.items.map(
      (project: any) => project.project_hash,
    );

    // Подсчитываем общее количество компонентов
    const totalComponents = projectStore.projects.items.reduce(
      (sum: number, project: any) => {
        return sum + (project.components?.length || 0);
      },
      0,
    );

    emit('dataLoaded', projectHashes, totalComponents);
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error);
    FailAlert('Не удалось загрузить список проектов');
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

  // Эмитим изменение пагинации для родительской страницы
  emit('paginationChanged', {
    page,
    rowsPerPage,
    sortBy,
    descending,
  });

  await loadProjects(pagination.value);
};

const handleToggleExpand = (projectHash: string) => {
  emit('toggleExpand', projectHash);
};

const handleOpenProject = (projectHash: string) => {
  emit('openProject', projectHash);
};


// Загружаем данные при монтировании
onMounted(async () => {
  await loadProjects();
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
    name: 'prefix',
    label: 'Префикс',
    align: 'left' as const,
    field: 'prefix' as const,
    sortable: true,
  },
  {
    name: 'name',
    label: 'Название',
    align: 'left' as const,
    field: 'title' as const,
    sortable: true,
  },
  {
    name: 'master',
    label: '',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'actions',
    label: '',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
  },
];
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
