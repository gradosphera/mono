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
        square
      )
        template(#body-cell-hash='props')
          q-td(:props='props')
            q-btn(
              @click='openProject(props.row.project_hash)',
              flat,
              dense,
              color='primary',
              icon='visibility',
              :label='props.row.project_hash ? props.row.project_hash.substring(0, 8) + "..." : ""'
            )

        template(#body-cell-status='props')
          q-td(:props='props')
            q-chip(
              :color='getProjectStatusColor(props.value)',
              text-color='white',
              dense,
              :label='getProjectStatusLabel(props.value)'
            )

        template(#body-cell-created_at='props')
          q-td(:props='props')
            div {{ formatDate(props.value) }}

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
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from 'app/extensions/capital/shared/lib/projectStatus';
import { useHeaderActions } from 'src/shared/hooks';
import { CreateProjectButton } from 'app/extensions/capital/features/Project/CreateProject';

const router = useRouter();
const projectStore = useProjectStore();
const { info } = useSystemStore();

// Регистрируем кнопку создания проекта в header
const { registerAction } = useHeaderActions();

const loading = ref(false);

// Определяем столбцы таблицы
const columns = [
  {
    name: 'hash',
    label: 'ID проекта',
    align: 'left' as const,
    field: 'project_hash' as const,
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
    name: 'description',
    label: 'Описание',
    align: 'left' as const,
    field: 'description' as const,
    sortable: false,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'center' as const,
    field: 'status' as const,
    sortable: true,
  },
  {
    name: 'created_at',
    label: 'Создан',
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

// Загрузка проектов
const loadProjects = async () => {
  loading.value = true;
  try {
    await projectStore.loadProjects({
      data: {
        coopname: info.coopname,
      },
      pagination: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
      },
    });
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
        hash: projectHash,
      },
    });
  }
};

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return '';
  }
};

// Инициализация
onMounted(async () => {
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
