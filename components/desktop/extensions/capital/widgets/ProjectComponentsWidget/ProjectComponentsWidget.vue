<template lang="pug">
q-card(flat)
  q-table(
    :rows='components || []',
    :columns='columns',
    row-key='project_hash',
    :loading='false',
    flat,
    square,
    hide-header,
    hide-bottom
  )
    template(#body='props')
      q-tr(
        :props='props',
        @click='emit("openComponent", props.row.project_hash)',
        style='cursor: pointer'
      )
        q-td(
          style='max-width: 200px; word-wrap: break-word; white-space: normal'
        ) {{ props.row.title }}
        q-td(style='text-align: right')
          q-chip(
            :color='getProjectStatusColor(props.row.status)',
            text-color='white',
            :label='getProjectStatusLabel(props.row.status)'
          )
</template>

<script lang="ts" setup>
import type { IProjectComponent } from 'app/extensions/capital/entities/Project/model';
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from 'app/extensions/capital/shared/lib/projectStatus';

defineProps<{
  components: IProjectComponent[] | undefined;
}>();

const emit = defineEmits<{
  openComponent: [projectHash: string];
}>();

// Определяем столбцы таблицы
const columns = [
  {
    name: 'status',
    label: 'Статус',
    align: 'left' as const,
    field: 'status' as const,
    sortable: true,
  },
  {
    name: 'name',
    label: 'Название',
    align: 'left' as const,
    field: 'title' as const,
    sortable: true,
  },
];
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}
</style>
