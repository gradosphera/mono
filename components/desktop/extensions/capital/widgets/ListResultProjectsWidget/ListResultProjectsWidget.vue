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
    no-data-label='Нет проектов для отправки результатов'
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
            ColorCard(:color='getStatusCardColor(tableProps.row.status)')
              .card-label Статус
              .card-value {{ getStatusCardText(tableProps.row.status) }}
            ColorCard(:color='getStatusCardColor(tableProps.row.status)')
              .card-label Участники
              .card-value {{ getTotalParticipants(tableProps.row) }}
            ColorCard(:color='getStatusCardColor(tableProps.row.status)')
              .card-label Общая сумма
              .card-value {{ formatAsset2Digits(tableProps.row.fact?.total || `0 ${info.symbols.root_govern_symbol}`) }}
            ColorCard(:color='getStatusCardColor(tableProps.row.status)')
              .card-label Себестоимость
              .card-value {{ getTotalBaseCost(tableProps.row) }}
            ColorCard(:color='getStatusCardColor(tableProps.row.status)')
              .card-label Премии вкладчиков
              .card-value {{ formatAsset2Digits(tableProps.row.fact?.contributors_bonus_pool || `0 ${info.symbols.root_govern_symbol}`) }}
            ColorCard(:color='getStatusCardColor(tableProps.row.status)')
              .card-label Премии генерации
              .card-value {{ getGenerationBonuses(tableProps.row) }}

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
import { useSystemStore } from 'src/entities/System/model';
import { formatAsset2Digits } from 'src/shared/lib/utils';
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
const { info } = useSystemStore();

const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0,
});

const projects = computed(() => projectStore.projects);

// Определение цвета для карточки статуса
const getStatusCardColor = (status: string) => {
  const projectStatus = status as Zeus.ProjectStatus;
  switch (projectStatus) {
    case Zeus.ProjectStatus.VOTING:
      return 'blue' as const;
    case Zeus.ProjectStatus.COMPLETED:
    case Zeus.ProjectStatus.FINISHED:
      return 'green' as const;
    default:
      return 'grey' as const;
  }
};

// Определение текста для карточки статуса
const getStatusCardText = (status: string) => {
  const projectStatus = status as Zeus.ProjectStatus;
  switch (projectStatus) {
    case Zeus.ProjectStatus.VOTING:
      return 'Голосование';
    case Zeus.ProjectStatus.COMPLETED:
      return 'Завершено';
    case Zeus.ProjectStatus.FINISHED:
      return 'Готово';
    default:
      return 'Неизвестно';
  }
};

// Расчет общего количества участников проекта
const getTotalParticipants = (project: any) => {
  if (!project.counts) return 0;
  return (
    (project.counts.total_authors || 0) +
    (project.counts.total_coordinators || 0) +
    (project.counts.total_creators || 0) +
    (project.counts.total_investors || 0) +
    (project.counts.total_propertors || 0) +
    (project.counts.total_contributors || 0)
  );
};

// Расчет общей себестоимости проекта
const getTotalBaseCost = (project: any) => {
  if (!project.fact) return formatAsset2Digits(`0 ${info.symbols.root_govern_symbol}`);
  const baseCosts = [
    parseFloat(project.fact.creators_base_pool || '0'),
    parseFloat(project.fact.authors_base_pool || '0'),
    parseFloat(project.fact.coordinators_base_pool || '0'),
    parseFloat(project.fact.property_base_pool || '0')
  ];
  const total = baseCosts.reduce((sum, cost) => sum + cost, 0);
  return formatAsset2Digits(`${total} ${info.symbols.root_govern_symbol}`);
};

// Расчет премий генерации (авторы + создатели)
const getGenerationBonuses = (project: any) => {
  if (!project.fact) return formatAsset2Digits(`0 ${info.symbols.root_govern_symbol}`);
  const bonuses = [
    parseFloat(project.fact.creators_bonus_pool || '0'),
    parseFloat(project.fact.authors_bonus_pool || '0')
  ];
  const total = bonuses.reduce((sum, bonus) => sum + bonus, 0);
  return formatAsset2Digits(`${total} ${info.symbols.root_govern_symbol}`);
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
    name: 'status',
    label: 'Информация',
    align: 'right' as const,
    field: 'status',
  },
];

const onRequest = async (props: any) => {
  loading.value = true;

  try {
    await projectStore.loadProjects({
      filter: {
        coopname: props.coopname,
        statuses: [Zeus.ProjectStatus.VOTING, Zeus.ProjectStatus.COMPLETED, Zeus.ProjectStatus.FINISHED],
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
    console.error('Error loading result projects:', error);
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
