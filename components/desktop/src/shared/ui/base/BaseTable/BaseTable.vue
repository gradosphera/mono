<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="{ 'col-num': col.numeric, 'col-action': col.align === 'right' && !col.numeric }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="(rowKey && (row as Record<string, unknown>)[rowKey as string] as string) ?? idx">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ 'col-num': col.numeric, 'col-action': col.align === 'right' && !col.numeric }"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="getValue(row, col)">
              {{ getValue(row, col) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="$slots.footer" class="table-foot">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { BaseTableProps, BaseTableColumn } from './BaseTable.types';

defineProps<BaseTableProps<T>>();

function getValue(row: T, col: BaseTableColumn<T>): unknown {
  if (typeof col.field === 'function') return col.field(row);
  const key = (col.field ?? col.key) as keyof T;
  return row[key];
}
</script>
