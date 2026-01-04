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
          .text-weight-bold {{ project?.is_planed ? formatValue(project?.plan?.[props.row.key], props.row.key) : 'не установлено' }}
        q-td.text-right
          .text-weight-bold {{ formatValue(project?.fact?.[props.row.key], props.row.key) }}
</template>

<script setup lang="ts">
import type { IProject, IProjectPermissions } from '../../entities/Project/model';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { formatHours } from 'src/shared/lib/utils/pluralizeHours';

defineProps<{
  project: IProject | null | undefined;
  permissions?: IProjectPermissions | null;
}>();

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
  { key: 'hour_cost', label: 'Стоимость часа создателей' },
  { key: 'creators_hours', label: 'Требуемый ресурс времени создателей' },
  { key: 'creators_base_pool', label: 'Себестоимость вклада создателей' },
  { key: 'authors_base_pool', label: 'Себестоимость вклада авторов' },
  { key: 'coordinators_base_pool', label: 'Себестоимость вклада координаторов' },
  { key: 'creators_bonus_pool', label: 'Премии создателей' },
  { key: 'authors_bonus_pool', label: 'Премии авторов' },
  { key: 'contributors_bonus_pool', label: 'Премии участников' },
  { key: 'target_expense_pool', label: 'Дополнительные расходы' },
  { key: 'total_received_investments', label: 'Привлекаемые инвестиции' },
  // { key: 'total_generation_pool', label: 'Общий генерационный пул' },
  // { key: 'total', label: 'Общая сумма' }
];

// Форматирование значений для отображения
const formatValue = (value: any, fieldKey?: string): string => {
  if (value == null || value === '') {
    return '—';
  }

  // Для поля "Требуемый ресурс времени создателей" показываем число с правильным склонением часов
  if (fieldKey === 'creators_hours') {
    if (typeof value === 'number') {
      return formatHours(value);
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
