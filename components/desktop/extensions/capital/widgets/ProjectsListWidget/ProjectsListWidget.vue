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
    :no-data-label='hasFiltersApplied ? "Нет результатов по фильтрам" : "Нет проектов"'
  )
    template(#body='props')
      q-tr(
        :props='props',
        @click='handleProjectClick(props.row.project_hash)',
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
        q-td(style='width: 100px')
          span.text-grey-7(v-if='props.row.prefix') {{ '#' + props.row.prefix }}

        q-td(
          style='cursor: pointer',
          @click.stop='() => router.push({ name: "project-components", params: { project_hash: props.row.project_hash } })'
        )
          .row.items-center.q-gutter-xs
            q-icon(
              :name='getProjectStatusIcon(props.row.status)',
              :color='getProjectStatusDotColor(props.row.status)',
              size='xs'
            ).q-mr-sm
            .title-container {{ props.row.title }}
        q-td.text-right(style='width: 200px')
          SetMasterButton(
            :project='props.row',
            dense,
            flat,
            @click.stop,
            :multiSelect='false'
            placeholder='',

          )
        q-td.text-right(style='width: 100px')
          CreateComponentButton(
            :project='props.row',
            :mini='true',
            @click.stop
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { SetMasterButton } from 'app/extensions/capital/features/Project/SetMaster';
import { CreateComponentButton } from 'app/extensions/capital/features/Project/CreateComponent';
import { getProjectStatusIcon, getProjectStatusDotColor } from 'app/extensions/capital/shared/lib/projectStatus';

const router = useRouter();

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
  projectClick: [projectHash: string];
  dataLoaded: [projectHashes: string[], totalComponents?: number];
}>();

const projectStore = useProjectStore();

const projects = ref<any>(null);
const loading = ref(false);

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

  await loadProjects(pagination.value);
};

const handleToggleExpand = (projectHash: string) => {
  emit('toggleExpand', projectHash);
};

const handleProjectClick = (projectHash: string) => {
  emit('projectClick', projectHash);
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
.title-container {
  font-weight: 500;
}

.q-chip {
  font-weight: 500;
}
</style>
