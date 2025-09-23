<template lang="pug">
q-card(flat)
  q-table(
    :rows='projects?.items || []',
    :columns='columns',
    row-key='project_hash',
    :loading='loading',
    :pagination='pagination',
    @request='onRequest',
    flat,
    square,
    hide-header,
    hide-bottom,
    no-data-label='Нет проектов на голосовании'
  )
    template(#body='tableProps')
      q-tr(
        :props='tableProps',
        @click='handleProjectClick(tableProps.row.project_hash)'
        style='cursor: pointer'
      )
        q-td(style='width: 55px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[tableProps.row.project_hash] ? "expand_more" : "chevron_right"',
            @click.stop='handleToggleExpand(tableProps.row.project_hash)'
          )
        q-td(
          style='cursor: pointer'
        )
          .title-container {{ tableProps.row.title }}
          .subtitle {{ tableProps.row.coopname }}
        q-td.text-right
          .voting-info
            .voting-item
              q-chip(
                color='blue',
                text-color='white',
                dense,
                :label='formatVotingDeadline(tableProps.row.voting?.voting_deadline)'
              )
              span.stat-label Голосование до
            .voting-item
              q-chip(
                color='orange',
                text-color='white',
                dense,
                :label='`${tableProps.row.voting?.total_voters || 0} участников`'
              )
              span.stat-label Проголосовало

      // Слот для дополнительного контента проекта
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[tableProps.row.project_hash]',
        :key='`e_${tableProps.row.project_hash}`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          slot(name='project-content', :project='tableProps.row')

  // Слот для дополнительного контента
  slot
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProjectStore } from '../../entities/Project/model';

interface Props {
  coopname: string;
  expanded: Record<string, boolean>;
}

interface Emits {
  (e: 'toggle-expand', value: string): void;
  (e: 'project-click', value: string): void;
  (e: 'data-loaded', value: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const projectStore = useProjectStore();

const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

const projects = computed(() => projectStore.projects);

// Колонки таблицы
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'left' as const,
    field: '',
  },
  {
    name: 'title',
    label: 'Проект',
    align: 'left' as const,
    field: 'title',
  },
  {
    name: 'voting',
    label: 'Голосование',
    align: 'right' as const,
    field: 'voting',
  },
];

const onRequest = async (props: any) => {
  loading.value = true;

  try {
    await projectStore.loadProjects({
      filter: {
        coopname: props.coopname,
        has_voting: true, // Фильтр для проектов с голосованиями
      },
      options: {
        page: props.pagination.page,
        limit: props.pagination.rowsPerPage,
        sortOrder: 'DESC',
      },
    });

    // Обновляем пагинацию
    if (projects.value) {
      pagination.value.rowsNumber = projects.value.totalCount;
    }

    // Эмитим загруженные хэши проектов для очистки expanded состояния
    const projectHashes = projects.value?.items.map(p => p.project_hash) || [];
    emit('data-loaded', projectHashes);
  } catch (error) {
    console.error('Error loading voting projects:', error);
  } finally {
    loading.value = false;
  }
};

const handleProjectClick = (projectHash: string) => {
  emit('project-click', projectHash);
};

const handleToggleExpand = (projectHash: string) => {
  emit('toggle-expand', projectHash);
};

const formatVotingDeadline = (deadline?: string) => {
  if (!deadline) return 'Не указано';

  try {
    const date = new Date(deadline);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return deadline;
  }
};

// Загружаем данные при монтировании
onMounted(() => {
  onRequest({
    pagination: pagination.value,
    coopname: props.coopname,
  });
});

// Перезагружаем при изменении coopname
watch(() => props.coopname, () => {
  onRequest({
    pagination: pagination.value,
    coopname: props.coopname,
  });
});
</script>

<style lang="scss" scoped>
.title-container {
  font-weight: 500;
  color: #1976d2;
}

.subtitle {
  font-size: 0.875rem;
  color: #666;
  margin-top: 2px;
}

.voting-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.voting-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .stat-label {
    font-size: 0.75rem;
    color: #666;
  }
}

.q-chip {
  font-size: 0.75rem;
}
</style>
