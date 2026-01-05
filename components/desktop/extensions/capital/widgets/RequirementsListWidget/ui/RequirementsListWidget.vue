<template lang="pug">
div

  q-card(flat)
    q-card-section(style='padding: 0px')
      q-table(
        :rows='requirements?.items || []',
        :columns='columns',
        :pagination='{ rowsPerPage: 0 }',
        row-key='_id',
        :loading='loading',
        flat,
        square,
        hide-header,
        hide-pagination
        no-data-label="Нет требований"
      )
        template(#body='props')
          q-tr(
            :props='props'
          )
            q-td
              .row.items-center(style='padding: 12px; min-height: 48px')
                // Пустое пространство для выравнивания с проектами/компонентами (55px)
                .col-auto(style='width: 55px; flex-shrink: 0')

                // Галочка статуса (60px)
                .col-auto(style='width: 60px; flex-shrink: 0')
                  q-checkbox(
                    :model-value='props.row.status',
                    :true-value='Zeus.StoryStatus.COMPLETED',
                    :false-value='Zeus.StoryStatus.PENDING',
                    dense,
                    @update:model-value='handleStatusChange(props.row, $event)',
                    @click.stop,
                    color='positive'
                  )

                // Title с типом (400px + отступ 20px)
                .col(style='width: 400px; padding-left: 20px')
                  .list-item-title(
                    @click.stop='handleRequirementClick(props.row)'
                    style='display: inline-block; vertical-align: top; word-wrap: break-word; white-space: normal'
                  )
                    span.text-body2.font-weight-medium {{ props.row.title }}

                // Индикатор типа
                .col-auto.ml-auto
                  .row.items-center.justify-end.q-gutter-xs
                    // Индикатор типа истории
                    q-badge(
                      v-if="props.row"
                      :color='getRequirementTypeColor(props.row)',
                      :label='getRequirementTypeLabel(props.row)'
                    )
                      q-icon(
                        :name='getRequirementTypeIcon(props.row)',
                        size='xs',
                        style='margin-right: 4px'
                      )

                    DeleteStoryButton(
                      :story-hash='props.row.story_hash',
                      @deleted='onRequirementDeleted',
                      @close='onDeleteDialogClose',
                      @click.stop
                    )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import {
  type IStory,
  useStoryStore,
  type IGetStoriesInput,
} from 'app/extensions/capital/entities/Story/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { DeleteStoryButton } from 'app/extensions/capital/features/Story/DeleteStory';
import { useUpdateStory } from 'app/extensions/capital/features/Story/UpdateStory';
import { Zeus } from '@coopenomics/sdk';

const props = defineProps<{
  filter?: Partial<IGetStoriesInput['filter']>;
  maxItems?: number;
}>();

const emit = defineEmits<{
  requirementClick: [requirement: IStory];
}>();

const storyStore = useStoryStore();
const { info } = useSystemStore();

const loading = ref(false);

// Реактивная связь с store
const requirements = computed(() => {
  if (!storyStore.stories) return null;

  // Сортируем требования: сперва незавершенные, затем завершенные
  const sortedItems = [...storyStore.stories.items].sort((a, b) => {
    // Определяем приоритет: незавершенные выше завершенных
    if (a.status === Zeus.StoryStatus.PENDING && b.status === Zeus.StoryStatus.COMPLETED) {
      return -1;
    }
    if (a.status === Zeus.StoryStatus.COMPLETED && b.status === Zeus.StoryStatus.PENDING) {
      return 1;
    }

    // Если статусы одинаковые - сортируем по sort_order, затем по _created_at
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return 0;
  });

  // Ограничиваем количество элементов если указано maxItems
  if (props.maxItems && sortedItems.length > props.maxItems) {
    return {
      ...storyStore.stories,
      items: sortedItems.slice(0, props.maxItems),
    };
  }

  return {
    ...storyStore.stories,
    items: sortedItems,
  };
});

// Определяем столбцы таблицы требований
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center' as const,
    field: '' as const,
    sortable: false,
  },
  {
    name: 'status',
    label: 'Статус',
    align: 'center' as const,
    field: 'status' as const,
    sortable: true,
  },
  {
    name: 'title',
    label: 'Требование',
    align: 'left' as const,
    field: 'title' as const,
    sortable: true,
  },
  {
    name: 'type',
    label: 'Тип',
    align: 'right' as const,
    field: '' as const,
    sortable: false,
  },
];

// Загрузка требований
const loadRequirements = async () => {
  loading.value = true;
  try {
    const filter: IGetStoriesInput['filter'] = {
      coopname: info.coopname,
      ...props.filter,
    };

    const options: IGetStoriesInput['options'] = {
      page: 1,
      limit: props.maxItems || 50,
      sortBy: '_created_at',
      sortOrder: 'DESC',
    };

    await storyStore.loadStories({ filter, options });
  } catch (error) {
    console.error('Ошибка при загрузке требований:', error);
    FailAlert('Не удалось загрузить требования');
  } finally {
    loading.value = false;
  }
};

// Функция для получения цвета бейджа типа требования
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getRequirementTypeColor = (_requirement: IStory): string => {
  return 'grey'; // Все бейджи серого цвета для спокойного вида
};

// Функция для получения текста бейджа типа требования
const getRequirementTypeLabel = (requirement: IStory): string => {
  if (requirement?.issue_hash) {
    // Для задачного требования берем первые 6 символов issue_hash
    const shortId = requirement.issue_hash.substring(0, 6);
    return `задача #${shortId}`;
  }
  if (requirement?.project_hash) {
    // Проверяем, является ли это требованием текущего проекта или компонента
    const currentProjectHash = props.filter?.project_hash;
    if (currentProjectHash && requirement.project_hash === currentProjectHash) {
      return 'проект'; // Требование текущего проекта/компонента
    } else {
      return 'компонент'; // Требование дочернего компонента
    }
  }
  return 'требование'; // Обычное требование
};

// Функция для получения иконки типа требования
const getRequirementTypeIcon = (requirement: IStory): string => {
  if (requirement?.issue_hash) {
    return 'task'; // Иконка для задачи
  }
  if (requirement?.project_hash) {
    // Проверяем, является ли это требованием текущего проекта или компонента
    const currentProjectHash = props.filter?.project_hash;
    if (currentProjectHash && requirement.project_hash === currentProjectHash) {
      return 'folder'; // Иконка для проекта
    } else {
      return 'extension'; // Иконка для компонента
    }
  }
  return 'description'; // Иконка для обычного требования
};

// Обработчик клика по заголовку требования
const handleRequirementClick = (requirement: IStory) => {
  emit('requirementClick', requirement);
};

// Обработчики для DeleteStoryButton
const onRequirementDeleted = () => {
  // Требование будет автоматически удалено из списка через store
};

const onDeleteDialogClose = () => {
  // Обработка закрытия диалога
};

// Изменение статуса требования
const handleStatusChange = async (
  requirement: IStory,
  newStatus: Zeus.StoryStatus,
) => {
  try {
    const updateData = {
      story_hash: requirement.story_hash,
      status: newStatus,
    };

    // Обновляем требование через API
    await useUpdateStory().updateStory(updateData);

    SuccessAlert('Статус требования обновлен');
  } catch (error) {
    console.error('Ошибка при обновлении статуса требования:', error);
    FailAlert('Не удалось обновить статус требования');
  }
};

// Инициализация
onMounted(async () => {
  await loadRequirements();
});
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

// Стили для бейджей типов требований
.q-badge {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 8px;
}
</style>
