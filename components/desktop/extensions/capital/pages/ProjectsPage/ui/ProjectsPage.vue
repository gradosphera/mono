<template lang="pug">
div
  q-card(flat)
    div
      // Таблица проектов
      q-table(
        :rows='projectStore.projects?.items || []',
        :columns='columns',
        row-key='project_hash',
        :loading='loading',
        :pagination='pagination',
        @request='onRequest',
        binary-state-sort,
        flat,
        square,
        hide-bottom,
        hide-header
      )
        template(#body='props')
          q-tr(
            :props='props',
            @click='toggleExpand(props.row.project_hash)',
            style='cursor: pointer'
          )
            q-td(style='width: 55px')
              q-btn(
                size='sm',
                color='primary',
                dense,
                round,
                :icon='expanded.get(props.row.project_hash) ? "expand_more" : "chevron_right"',
                @click.stop='toggleExpand(props.row.project_hash)'
              )
            q-td
              .title-container {{ props.row.title }}
            q-td.text-right
              ProjectMenuWidget(:project='props.row')

          q-tr.q-virtual-scroll--with-prev(
            no-hover,
            v-if='expanded.get(props.row.project_hash)',
            :key='`e_${props.row.project_hash}`'
          )
            q-td(colspan='100%', style='padding: 0px !important')
              ProjectComponentsWidget(
                :components='props.row.components',
                @open-component='openProject'
              )

    // Пагинация
    q-card-actions(align='center')
      q-pagination(
        v-model='pagination.page',
        :max='Math.ceil((projectStore.projects?.totalCount || 0) / pagination.rowsPerPage)',
        :max-pages='5',
        direction-links,
        boundary-links,
        @update:model-value='onRequest'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { useHeaderActions } from 'src/shared/hooks';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { CreateProjectButton } from 'app/extensions/capital/features/Project/CreateProject';
import { ProjectMenuWidget } from 'app/extensions/capital/widgets/ProjectMenuWidget';
import { ProjectComponentsWidget } from 'app/extensions/capital/widgets/ProjectComponentsWidget';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

const router = useRouter();
const projectStore = useProjectStore();
const { info } = useSystemStore();

// Регистрируем кнопку создания проекта в header
const { registerAction } = useHeaderActions();

const loading = ref(false);

// Композабл для управления состоянием развернутости проектов
const { expanded, loadExpandedState, cleanupExpandedState, toggleExpanded } =
  useExpandableState(
    'capital_projects_expanded',
    () => projectStore.projects?.items,
    (project) => project.project_hash,
  );

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

// UI методы
const toggleExpand = (projectHash: string) => {
  toggleExpanded(projectHash);
};

// Пагинация
const pagination = ref({
  sortBy: '_created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Загрузка проектов
const loadProjects = async () => {
  loading.value = true;
  try {
    await projectStore.loadProjects({
      filter: {
        coopname: info.coopname,
        parent_hash: '',
      },
      pagination: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
      },
    });
    console.log(projectStore.projects?.items);

    // Очищаем устаревшие записи expanded после загрузки проектов
    cleanupExpandedState();
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error);
    FailAlert('Не удалось загрузить список проектов');
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

  await loadProjects();
};

// Переход к задачам проекта
const openProject = (projectHash: string) => {
  if (projectHash) {
    router.push({
      name: 'project-tasks',
      params: {
        project_hash: projectHash,
      },
    });
  }
};

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadExpandedState();

  registerAction({
    id: 'create-project',
    component: markRaw(CreateProjectButton),
    order: 1,
  });
  await loadProjects();
});
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}
</style>
