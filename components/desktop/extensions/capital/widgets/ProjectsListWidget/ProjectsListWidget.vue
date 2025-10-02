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
    :no-data-label='hasFiltersApplied ? "Нет результатов по фильтрам" : "У вас нет проектов"'
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
        q-td(style='width: 100px')
          span(v-if='props.row.prefix').text-grey-7 {{ '#' + props.row.prefix }}
        q-td(
          style='cursor: pointer'
          @click.stop='() => router.push({ name: "project-components", params: { project_hash: props.row.project_hash } })'
        )
          .title-container {{ props.row.title }}
        q-td.text-right
          SetMasterButton(
            :project='props.row',
            dense,
            flat,
          )
          CreateComponentButton(
            :project='props.row',
            :mini='true',
          )
          ProjectMenuWidget(:project='props.row')

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
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { SetMasterButton } from 'app/extensions/capital/features/Project/SetMaster';
import { ProjectMenuWidget } from 'app/extensions/capital/widgets/ProjectMenuWidget';
import { CreateComponentButton } from 'app/extensions/capital/features/Project/CreateComponent';

const router = useRouter();

const props = defineProps<{
  coopname?: string;
  expanded: Record<string, boolean>;
  expandAll?: boolean;
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

// Watcher для автоматического развертывания/сворачивания всех проектов
watch(() => props.expandAll, (newValue, oldValue) => {
  if (projects.value?.items && newValue !== oldValue) {
    if (newValue) {
      // Развернуть все проекты
      const projectsToExpand = projects.value.items.filter((project: any) => !props.expanded[project.project_hash]);
      projectsToExpand.forEach((project: any) => {
        emit('toggleExpand', project.project_hash);
      });
    } else {
      // Свернуть все проекты
      projects.value.items.forEach((project: any) => {
        if (props.expanded[project.project_hash]) {
          emit('toggleExpand', project.project_hash);
        }
      });
    }
  }
});

// Watcher для применения expandAll после загрузки проектов
watch(() => projects.value, (newProjects) => {
  if (newProjects?.items && props.expandAll) {
    // Применить expandAll к вновь загруженным проектам
    newProjects.items.forEach((project: any) => {
      if (!props.expanded[project.project_hash]) {
        emit('toggleExpand', project.project_hash);
      }
    });
  }
});

// Пагинация
const pagination = ref({
  sortBy: '_created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
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
    const projectHashes = projectStore.projects.items.map((project: any) => project.project_hash);

    // Подсчитываем общее количество компонентов
    const totalComponents = projectStore.projects.items.reduce((sum: number, project: any) => {
      return sum + (project.components?.length || 0);
    }, 0);

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
