<template lang="pug">
q-card(flat)
  // Лоадер загрузки сегментов
  WindowLoader(v-if='loading', text='загрузка участников...')
  q-table(
    v-else
    :rows='segments?.items || []',
    :columns='columns',
    row-key='id',
    :pagination='{ rowsPerPage: 0 }',
    flat,
    square,
    hide-header,
    hide-pagination,
    :no-data-label='"Нет участников"'
  )


    template(#body='props')
      q-tr(:props='props')
        q-td
          .row.items-center(style='padding: 12px; min-height: 48px')
            // Порядковый номер
            .col-auto(style='width: 30px; flex-shrink: 0; text-align: center')
              span.text-caption.text-grey-6 {{ props.rowIndex + 1 }}

            // Иконка голоса
            .col-auto(style='flex-shrink: 0; width: 32px; text-align: center')
              q-icon(
                :name='props.row.has_vote ? "how_to_vote" : "person_off"',
                size='sm',
              )

            // Информация об участнике
            .col.q-ml-sm
              .row.items-center.justify-between
                // Левая часть: имя и роли
                .col-auto
                  // Имя участника
                  .row.items-center.q-mb-xs
                    span.text-body2 {{ props.row.display_name }}

                  // Роли участника
                  .row.items-center.q-gutter-xs
                    q-badge(
                      v-if='props.row.is_author',
                      color='primary',
                      label='автор'
                    )
                    q-badge(
                      v-if='props.row.is_creator',
                      color='primary',
                      label='создатель'
                    )
                    q-badge(
                      v-if='props.row.is_coordinator',
                      color='primary',
                      label='координатор'
                    )
                    q-badge(
                      v-if='props.row.is_investor',
                      color='primary',
                      label='инвестор'
                    )
                    q-badge(
                      v-if='props.row.is_propertor',
                      color='primary',
                      label='собственник'
                    )
                    q-badge(
                      v-if='props.row.is_contributor',
                      color='primary',
                      label='старший участник'
                    )

                // Средняя часть: вклад участника
                .col(style='width: 400px; padding-left: 16px')
                  .value-text(v-if='props.row.value')
                    | {{ props.row.value }}

                // Правая часть: стоимость взноса
                .col-auto
                  .row.items-center.q-gutter-xs
                    // Доля участника
                    ColorCard(color='blue')
                      .card-label доля в результате
                      .card-value {{ calculateShare(props.row.total_segment_cost) }}%

                    // Сумма взноса
                    ColorCard(color='green')
                      .card-label сумма взноса
                      .card-value {{ formatAsset2Digits(props.row.total_segment_cost) }}
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { QTableProps } from 'quasar';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { ColorCard } from 'src/shared/ui/ColorCard';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import type { ISegmentsPagination, IGetSegmentsInput } from 'app/extensions/capital/entities/Segment/model';
import type { IProject } from '../../entities/Project/model';

const props = defineProps<{
  project?: IProject | null;
}>();

const { info } = useSystemStore();
const segmentStore = useSegmentStore();

const segments = ref<ISegmentsPagination | null>(null);
const loading = ref(false);

// Загрузка сегментов-участников
const loadSegments = async () => {
  loading.value = true;

  try {
    const filter: NonNullable<IGetSegmentsInput['filter']> = {
      coopname: info.coopname,
    };

    // Фильтруем сегменты только конкретного проекта
    // Фильтрация по project_hash уже дает нам только сегменты этого проекта
    if (props.project?.project_hash) {
      filter.project_hash = props.project.project_hash;
    }

    const segmentsInput: IGetSegmentsInput = {
      filter,
      options: {
        page: 1,
        limit: 100,
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    };

    await segmentStore.loadSegments(segmentsInput);

    segments.value = segmentStore.segments;
  } catch (error) {
    console.error('Ошибка при загрузке сегментов:', error);
    FailAlert('Не удалось загрузить список участников');
  } finally {
    loading.value = false;
  }
};

// Функция расчета доли участника
const calculateShare = (totalSegmentCost: string): string => {
  if (!props.project?.fact?.total || !totalSegmentCost) return '0.00';

  const projectTotal = parseFloat(props.project.fact.total);
  const segmentCost = parseFloat(totalSegmentCost);

  if (projectTotal === 0 || segmentCost === 0) return '0.00';

  const share = (segmentCost / projectTotal) * 100;
  return share.toFixed(2);
};

// Загружаем данные при монтировании, если проект уже есть
onMounted(async () => {
  if (props.project) {
    await loadSegments();
  }
});

// Следим за изменением проекта и перезагружаем сегменты
watch(() => props.project, async (newProject) => {
  if (newProject) {
    await loadSegments();
  }
}, { immediate: false });

// Определяем столбцы таблицы
const columns: QTableProps['columns'] = [
  {
    name: 'contributor',
    label: 'Участник',
    align: 'left',
    field: 'display_name',
    sortable: true,
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

.q-badge {
  font-weight: 500;
  margin-right: 4px;
}

.value-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--q-primary);
  display: inline-block;
  vertical-align: top;
  word-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}
</style>
