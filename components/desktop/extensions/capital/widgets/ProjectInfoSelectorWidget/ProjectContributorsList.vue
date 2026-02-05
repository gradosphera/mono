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
              RefreshSegmentButton(:segment='props.row', size='sm', round, flat, icon='refresh', label="")

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
                      v-for='(title, role) in roleTitles',
                      :key='role',
                      :color='getRoleColor(role, props.row, parseValueData(props.row.value).roles)',
                      :label='title'
                    )

                  // Текст описания участника
                  .row.q-mt-sm(v-if='parseValueData(props.row.value).text')
                    .col-12
                      .description-text {{ parseValueData(props.row.value).text }}

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
                      .card-value
                        | {{ formatAsset2Digits(props.row.total_segment_cost) }}
                        | {{ props.row.is_investor && calculateUnusedInvestment(props.row) !== "0" ? `(+${formatAsset2Digits(calculateUnusedInvestment(props.row) + ' RUB')})` : '' }}
                      //- p {{props.row.total_segment_cost}}
                      //- p {{project?.fact?.total}}

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
import RefreshSegmentButton from '../../features/Project/RefreshSegment/ui/RefreshSegmentButton.vue';

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
        limit: 1000,
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    };
    console.log('segmentsInput', segmentsInput)
    await segmentStore.loadSegments(segmentsInput);

    segments.value = segmentStore.getSegmentsByProject(props.project?.project_hash || '');
  } catch (error) {
    console.error('Ошибка при загрузке сегментов:', error);
    FailAlert('Не удалось загрузить список участников');
  } finally {
    loading.value = false;
  }
};

// Функция расчета неиспользованных инвестиций для инвестора
const calculateUnusedInvestment = (row: any): string => {
  if (!row.is_investor) return '0';

  const investorAmount = parseFloat(row.investor_amount || '0');
  const investorBase = parseFloat(row.investor_base || '0');

  const unused = investorAmount - investorBase;
  return unused > 0 ? unused.toFixed(4) : '0';
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

// Функция для парсинга данных из value (JSON строка)
const parseValueData = (value: string | null | undefined) => {
  if (!value) return { text: '', roles: [] };

  try {
    const parsed = JSON.parse(value);
    return {
      text: parsed.text || '',
      roles: Array.isArray(parsed.roles) ? parsed.roles : []
    };
  } catch {
    return { text: '', roles: [] };
  }
};

// Маппинг ролей для отображения
const roleTitles: Record<string, string> = {
  'author': 'Соавтор',
  'creator': 'Исполнитель',
  'investor': 'Инвестор',
  'contributor': 'Ранний участник'
};

// Маппинг полей row на значения ролей
const roleFields: Record<string, string> = {
  'author': 'is_author',
  'creator': 'is_creator',
  'investor': 'is_investor',
  'contributor': 'is_contributor'
};

// Функция определения цвета для роли
const getRoleColor = (role: string, row: any, claimedRoles: string[]): string => {
  const isExecuted = row[roleFields[role]]; // роль исполняется
  const isClaimed = claimedRoles.includes(role); // роль заявлена

  if (isExecuted || (isExecuted && isClaimed)) {
    return 'primary'; // синий для исполняемых
  } else if (isClaimed) {
    return 'grey'; // серый для только заявленных
  }
  return 'grey'; // серый по умолчанию
};

// Загружаем данные при монтировании, если проект уже есть
onMounted(async () => {
  if (props.project) {
    await loadSegments();
  }
});

// Следим за изменением project_hash проекта и перезагружаем сегменты
watch(() => props.project?.project_hash, async (newHash, oldHash) => {
  if (newHash && newHash !== oldHash) {
    await loadSegments();
  }
}, { immediate: false });

// Следим за изменениями в fact.total проекта, которые влияют на расчет долей
// Перезагружаем сегменты при изменении общей суммы проекта
watch(() => props.project?.fact?.total, async (newTotal, oldTotal) => {
  if (newTotal !== oldTotal && props.project?.project_hash) {
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

.description-text {
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}
</style>
