<template lang="pug">
q-card(flat)

  // Таблица сравнения плана и факта (всегда показывается)
  q-table(
    :rows='comparisonFields',
    :columns='tableColumns',
    row-key='key',
    flat,
    square,
    :pagination='{ rowsPerPage: 0 }',
    :no-data-label='"Нет данных"'
    hide-pagination
  )

    template(#body='props')
      q-tr(:props='props')
        q-td {{ props.row.label }}
        q-td.text-right
          .text-weight-bold {{ (alwaysShowPlan || project?.is_planed) ? formatValue(getPlanValue(props.row.key), props.row.key) : 'не установлено' }}
        q-td.text-right
          .text-weight-bold {{ formatValue(project?.fact?.[props.row.key], props.row.key) }}
        //- p {{ project?.plan.total}}
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import type { IProject, IProjectComponent, IProjectPermissions } from '../../entities/Project/model';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { formatHours } from 'src/shared/lib/utils/pluralizeHours';

const props = defineProps<{
  project: IProject | IProjectComponent | null | undefined;
  permissions?: IProjectPermissions | null;
  alwaysShowPlan?: boolean;
}>();

const { project } = toRefs(props);

// Колонки для таблицы сравнения плана и факта
const tableColumns = [
  {
    name: 'label',
    label: 'Показатель',
    align: 'left' as const,
    field: 'label' as const,
    sortable: false,
  },
  {
    name: 'plan',
    label: 'План',
    align: 'right' as const,
    field: 'plan' as const,
    sortable: false,
  },
  {
    name: 'fact',
    label: 'Факт',
    align: 'right' as const,
    field: 'fact' as const,
    sortable: false,
  },
];

// Поля для сравнения плана и факта
const comparisonFields = [
  { key: 'hour_cost', label: 'Стоимость часа исполнителей' },
  { key: 'creators_hours', label: 'Требуемый ресурс времени исполнителей' },
  { key: 'creators_base_pool', label: 'Стоимость профессионального времени исполнителей' },
  { key: 'authors_base_pool', label: 'Стоимость профессионального времени соавторов' },
  { key: 'coordinators_base_pool', label: 'Стоимость профессионального времени координаторов' },
  { key: 'creators_bonus_pool', label: 'Стоимость общественно-полезного времени исполнителей' },
  { key: 'authors_bonus_pool', label: 'Стоимость общественно-полезного времени соавторов' },
  { key: 'contributors_bonus_pool', label: 'Распределение на участников Благороста' },
  { key: 'target_expense_pool', label: 'Дополнительные расходы' },
  { key: 'total_received_investments', label: 'Привлекаемые инвестиции' },
  { key: 'total', label: 'Стоимость результата интеллектуальной деятельности' }
];

// Форматирование значений для отображения
const getPlanValue = (key: string) => {
  if (key === 'used_expense_pool') {
    return (project.value as any)?.plan?.['target_expense_pool'];
  }
  return (project.value as any)?.plan?.[key];
};

const formatValue = (value: any, fieldKey?: string): string => {
  if (value == null || value === '') {
    return '—';
  }

  // Для поля "Требуемый ресурс времени исполнителей" показываем число с правильным склонением часов
  if (fieldKey === 'creators_hours') {
    if (typeof value === 'number') {
      return formatHours(value);
    }
    return String(value);
  }

  // Для поля "Коэффициент использования инвестиций" показываем процент
  if (fieldKey === 'use_invest_percent') {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}%`;
    }
    return String(value);
  }

  // Для всех остальных полей применяем formatAsset2Digits
  if (typeof value === 'string') {
    return formatAsset2Digits(value);
  }
  if (typeof value === 'number') {
    return formatAsset2Digits(value.toString());
  }
  return String(value);
};
</script>
