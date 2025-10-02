<template lang="pug">
q-card(flat, style='margin-left: 20px; margin-top: 8px;')
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
        q-td(style='width: 80px; padding-left: 40px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[props.row.project_hash] ? "expand_more" : "chevron_right"',
            @click.stop='handleToggleComponent(props.row.project_hash)'
          )
        q-td(style='width: 100px')
          span(v-if='props.row.prefix').text-grey-7 {{ '#' + props.row.prefix }}
        q-td(
          style='max-width: 200px; word-wrap: break-word; white-space: normal; cursor: pointer'
          @click='handleComponentClick(props.row.project_hash)'
        )
          | {{ props.row.title }}
        q-td(style='width: 80px; text-align: center')
          span(v-if='props.row.issue_counter').text-grey-7 {{ props.row.issue_counter }}
        q-td(style='width: 120px; text-align: right')
          q-chip(
            :color='getProjectStatusColor(props.row.status)',
            text-color='white',
            :label='getProjectStatusLabel(props.row.status)'
          )
          CreateIssueButton(
            :mini='true',
            :project-hash='props.row.project_hash'
          )
          ProjectMenuWidget(:project='props.row')

      // Слот для дополнительного контента компонента
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[props.row.project_hash]',
        :key='`e_${props.row.project_hash}`'
      )
        q-td(colspan='100%', style='padding: 0px 0px 0px 80px !important')
          slot(name='component-content', :component='props.row')
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import type { IProjectComponent } from 'app/extensions/capital/entities/Project/model';
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from 'app/extensions/capital/shared/lib/projectStatus';
import { CreateIssueButton } from 'app/extensions/capital/features/Issue/CreateIssue';
import { ProjectMenuWidget } from 'app/extensions/capital/widgets/ProjectMenuWidget';

const props = defineProps<{
  components: IProjectComponent[] | undefined;
  expanded: Record<string, boolean>;
  expandAll?: boolean;
}>();

const emit = defineEmits<{
  openComponent: [projectHash: string];
  toggleComponent: [componentHash: string];
}>();

// Watcher для автоматического развертывания/сворачивания всех компонентов
watch(() => props.expandAll, (newValue, oldValue) => {
  if (props.components && newValue !== oldValue) {
    if (newValue) {
      // Небольшая задержка, чтобы компоненты успели загрузиться после разворота проектов
      setTimeout(() => {
        if (props.components) {
          props.components.forEach((component) => {
            if (!props.expanded[component.project_hash]) {
              emit('toggleComponent', component.project_hash);
            }
          });
        }
      }, 200);
    } else {
      // Свернуть все компоненты
      props.components.forEach((component) => {
        if (props.expanded[component.project_hash]) {
          emit('toggleComponent', component.project_hash);
        }
      });
    }
  }
});

// Watcher для применения expandAll после загрузки компонентов
watch(() => props.components, (newComponents) => {
  if (newComponents && props.expandAll) {
    // Небольшая задержка для стабильности
    setTimeout(() => {
      if (props.components) {
        props.components.forEach((component) => {
          if (!props.expanded[component.project_hash]) {
            emit('toggleComponent', component.project_hash);
          }
        });
      }
    }, 50);
  }
});

const handleToggleComponent = (componentHash: string) => {
  emit('toggleComponent', componentHash);
};

const handleComponentClick = (componentHash: string) => {
  emit('openComponent', componentHash);
};

// Определяем столбцы таблицы
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'prefix',
    label: 'Префикс',
    align: 'left' as const,
    field: 'prefix' as const,
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
    name: 'issues',
    label: 'Задачи',
    align: 'center' as const,
    field: 'issue_counter' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
  },
];
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}
</style>
