<template lang="pug">
q-card(flat)
  q-table(
    :rows='projects?.items || []',
    :columns='columns',
    row-key='project_hash',
    :pagination='pagination',
    @request='onRequest',
    flat,
    square,
    hide-header,
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
          .subtitle {{ tableProps.row.parent_title }}
        q-td.text-right
          .row.q-gutter-sm.justify-end
            ColorCard(:color='getDeadlineCardColor(tableProps.row.status)')
              .card-label Голосование до
              .card-value {{ getDeadlineCardText(tableProps.row.status, tableProps.row.voting?.voting_deadline) }}
            ColorCard(color='orange')
              .card-label Голосуют
              .card-value {{ tableProps.row.voting?.total_voters || 0 }} {{ getContributorWord(tableProps.row.voting?.total_voters || 0) }}
            ColorCard(:color='getVotingStatus(tableProps.row.status).color')
              .card-label Статус
              .card-value {{ getVotingStatus(tableProps.row.status).text }}

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
import { ColorCard } from 'src/shared/ui/ColorCard/ui';
import { Zeus } from '@coopenomics/sdk';

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
  rowsPerPage: 100,
  rowsNumber: 0,
});

const projects = computed(() => projectStore.projects);

// Определение статуса голосования
const getVotingStatus = (status: string) => {
  const projectStatus = status as Zeus.ProjectStatus;
  if (projectStatus === Zeus.ProjectStatus.VOTING) {
    return { text: 'Активно', color: 'green' as const };
  } else if (projectStatus === Zeus.ProjectStatus.RESULT || projectStatus === Zeus.ProjectStatus.CANCELLED) {
    return { text: 'Завершено', color: 'red' as const };
  }
  return { text: 'Неизвестно', color: 'grey' as const };
};

// Определение цвета для карточки "Голосование до"
const getDeadlineCardColor = (status: string) => {
  const projectStatus = status as Zeus.ProjectStatus;
  if (projectStatus === Zeus.ProjectStatus.RESULT || projectStatus === Zeus.ProjectStatus.CANCELLED) {
    return 'red' as const; // Завершено - красный
  }
  return 'blue' as const; // Активно - синий
};

// Определение текста для карточки "Голосование до"
const getDeadlineCardText = (status: string, deadline?: string) => {
  const projectStatus = status as Zeus.ProjectStatus;
  const formattedDeadline = formatVotingDeadline(deadline);

  if (projectStatus === Zeus.ProjectStatus.RESULT || projectStatus === Zeus.ProjectStatus.CANCELLED) {
    return `Завершено ${formattedDeadline}`;
  }
  return formattedDeadline;
};

// Склонение слова "вкладчик"
const getContributorWord = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'вкладчиков';
  }

  if (lastDigit === 1) {
    return 'вкладчик';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'вкладчика';
  }

  return 'вкладчиков';
};

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
    pagination.value.rowsNumber = projects.value.totalCount;

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
  console.log('onMounted', props.coopname)
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
</style>
