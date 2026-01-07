<template lang="pug">
q-card(flat)
  q-table(
    :rows='components || []',
    :columns='columns',
    row-key='project_hash',
    :loading='false',
    :pagination='{ rowsPerPage: 0 }',
    flat,
    square,
    hide-header,
    hide-pagination,
    no-data-label='Нет компонентов'
  )
    template(#body='props')
      q-tr(
        :props='props'
      )
        q-td
          .row.items-center(style='padding: 25px; min-height: 48px')
            // Кнопка раскрытия (55px)
            .col-auto(style='width: 55px; flex-shrink: 0')
              q-btn(
                size='sm',
                color='primary',
                dense,
                round,
                :icon='expanded[props.row.project_hash] ? "expand_more" : "chevron_right"',
                @click.stop='handleToggleComponent(props.row.project_hash)'
              )

            // ID с иконкой (100px + отступ 0px)
            .col-auto(style='width: 100px; flex-shrink: 0')
              q-icon(name='extension', size='xs').q-mr-xs
              span.list-item-title(
                v-if='props.row.prefix'
                @click.stop='handleOpenComponent(props.row.project_hash)'
              ) {{ '#' + props.row.prefix }}

            // Title со статусом (400px)
            .col(style='width: 400px; padding-left: 10px')
              .list-item-title(
                @click.stop='handleOpenComponent(props.row.project_hash)'
                style='display: inline-block; vertical-align: top; word-wrap: break-word; white-space: normal'
              )
                q-icon(
                  :name='getProjectStatusIcon(props.row.status)',
                  :color='getProjectStatusDotColor(props.row.status)',
                  size='xs'
                ).q-mr-sm
                span {{ props.row.title }}

            // Actions - CreateIssueButton и кнопка перехода (140px, выравнивание по правому краю)
            .col-auto.ml-auto(style='width: 140px')
              .row.items-center.justify-end.q-gutter-xs
                CreateIssueButton(
                  @click.stop,
                  :mini='true',
                  :project-hash='props.row.project_hash'
                )
                q-btn(
                  size='xs',
                  flat,
                  icon='arrow_forward',
                  @click.stop='handleOpenComponent(props.row.project_hash)'
                )
                //- ProjectMenuWidget(:project='props.row', @click.stop)

      // Слот для дополнительного контента компонента
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[props.row.project_hash]',
        :key='`e_${props.row.project_hash}`'
      )
        q-td(colspan='100%')
          // Скелетон загрузки
          div(v-if='loadingComponents[props.row.project_hash]', style='padding: 16px')
            q-skeleton(height='24px', style='margin-bottom: 8px')
            q-skeleton(height='24px', style='margin-bottom: 8px')
            q-skeleton(height='24px', style='margin-bottom: 8px')
            q-skeleton(height='24px')
          // Реальный контент
          slot(v-else, name='component-content', :component='props.row')
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { IProjectComponent } from 'app/extensions/capital/entities/Project/model';
import {
  getProjectStatusIcon,
  getProjectStatusDotColor,
} from 'app/extensions/capital/shared/lib/projectStatus';
import { CreateIssueButton } from 'app/extensions/capital/features/Issue/CreateIssue';
// import { ProjectMenuWidget } from 'app/extensions/capital/widgets/ProjectMenuWidget';

const props = defineProps<{
  components: IProjectComponent[] | undefined;
  expanded: Record<string, boolean>;
  expandAll?: boolean;
}>();

const emit = defineEmits<{
  openComponent: [projectHash: string];
  toggleComponent: [componentHash: string];
}>();

// Локальное состояние загрузки для каждого компонента
const loadingComponents = ref<Record<string, boolean>>({});

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
  // Если компонент разворачивается (становится expanded), устанавливаем loading
  if (!props.expanded[componentHash]) {
    loadingComponents.value[componentHash] = true;
    // Снимаем loading через 100мс, чтобы кнопка реагировала сразу
    setTimeout(() => {
      loadingComponents.value[componentHash] = false;
    }, 100);
  }
  emit('toggleComponent', componentHash);
};

const handleOpenComponent = (componentHash: string) => {
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
    name: 'master',
    label: '',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
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
.q-table {
  tr {
    min-height: 48px;
  }

  .q-td {
    padding: 0; // Убираем padding таблицы, так как теперь используем внутренний padding
  }
}

.q-chip {
  font-weight: 500;
}

// Импорт глобального стиля для подсветки
:deep(.list-item-title) {
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--q-accent);
  }
}
</style>
