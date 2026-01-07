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

                // Иконка типа (кликабельная)
                .col-auto(style='width: 32px; flex-shrink: 0')
                  q-icon(
                    v-if="props.row"
                    :name='getRequirementTypeIcon(props.row)',
                    size='sm',
                    style='cursor: pointer; color: #666'
                    @click.stop='handleRequirementTypeClick(props.row)'
                  )

                // Title с типом (остальное пространство)
                .col
                  .list-item-title(
                    @click.stop='handleRequirementTypeClick(props.row)'
                    style='display: inline-block; vertical-align: top; word-wrap: break-word; white-space: normal; cursor: pointer'
                  )
                    span.text-body2.font-weight-medium {{ props.row.title }}
                    // Название источника требования
                    div.text-caption.text-grey-6.q-mt-xs {{ getSourceTitle(props.row) }}

                // Кнопка удаления (правый край)
                .col-auto.ml-auto
                  DeleteStoryButton(
                    :story-hash='props.row.story_hash',
                    @deleted='onRequirementDeleted',
                    @close='onDeleteDialogClose',
                    @click.stop
                  )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  type IStory,
  useStoryStore,
  type IGetStoriesInput,
} from 'app/extensions/capital/entities/Story/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { api as ProjectApi } from 'app/extensions/capital/entities/Project/api';
import { api as IssueApi } from 'app/extensions/capital/entities/Issue/api';
import { DeleteStoryButton } from 'app/extensions/capital/features/Story/DeleteStory';
import { useUpdateStory } from 'app/extensions/capital/features/Story/UpdateStory';
import { Zeus } from '@coopenomics/sdk';

const props = defineProps<{
  filter?: Partial<IGetStoriesInput['filter']>;
  maxItems?: number;
}>();

// emit больше не используется, теперь клик на title ведет к навигации

const storyStore = useStoryStore();
const { info } = useSystemStore();
const router = useRouter();

// Кэш для хранения загруженных названий проектов и задач
const projectTitles = ref<Record<string, string>>({});
const issueTitles = ref<Record<string, string>>({});
const loadingTitles = ref<Record<string, boolean>>({});

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

// Функция для получения названия источника требования
const getSourceTitle = (requirement: IStory): string => {
  const key = requirement.issue_hash || requirement.project_hash;
  if (!key) return 'Требование';

  if (requirement.issue_hash) {
    if (issueTitles.value[requirement.issue_hash]) {
      return `Задача: ${issueTitles.value[requirement.issue_hash]}`;
    }
    return loadingTitles.value[key] ? 'Загрузка...' : `Задача #${requirement.issue_hash.substring(0, 6)}`;
  }

  if (requirement.project_hash) {
    if (projectTitles.value[requirement.project_hash]) {
      const title = projectTitles.value[requirement.project_hash];
      const isComponent = title.startsWith('[Компонент]');
      const cleanTitle = title.replace(/^\[Компонент\]|\[Проект\]/, '').trim();
      return isComponent ? `Компонент: ${cleanTitle}` : `Проект: ${cleanTitle}`;
    }

    const currentProjectHash = props.filter?.project_hash;
    if (currentProjectHash && requirement.project_hash === currentProjectHash) {
      return loadingTitles.value[key] ? 'Загрузка...' : 'Требование текущего проекта';
    } else {
      return loadingTitles.value[key] ? 'Загрузка...' : 'Требование компонента';
    }
  }

  return 'Требование';
};

// Функция для загрузки названия источника требования
const loadSourceTitle = async (requirement: IStory) => {
  const key = requirement.issue_hash || requirement.project_hash;
  if (!key || loadingTitles.value[key]) return;

  loadingTitles.value[key] = true;

  try {
    if (requirement.issue_hash && !issueTitles.value[requirement.issue_hash]) {
      const issueData = await IssueApi.loadIssue({
        issue_hash: requirement.issue_hash,
      });

      if (issueData?.title) {
        issueTitles.value[requirement.issue_hash] = issueData.title;
      }
    }

    if (requirement.project_hash && !projectTitles.value[requirement.project_hash]) {
      const projectData = await ProjectApi.loadProject({
        hash: requirement.project_hash,
      });

      if (projectData?.title) {
        const prefix = projectData.parent_hash ? '[Компонент]' : '[Проект]';
        projectTitles.value[requirement.project_hash] = `${prefix}${projectData.title}`;
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке названия:', error);
  } finally {
    loadingTitles.value[key] = false;
  }
};

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


// Обработчик клика по типу требования (бейдж)
const handleRequirementTypeClick = async (requirement: IStory) => {
  if (requirement?.issue_hash && requirement?.project_hash) {
    // Определяем тип родительского проекта для правильного маршрута задачи
    try {
      const projectData = await ProjectApi.loadProject({
        hash: requirement.project_hash,
      });

      if (projectData) {
        // Если у проекта есть parent_hash, это компонент - используем component-issue
        const routeName = projectData.parent_hash ? 'component-issue' : 'project-issue';

        router.push({
          name: routeName,
          params: {
            project_hash: requirement.project_hash,
            issue_hash: requirement.issue_hash
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при определении типа родительского проекта:', error);
      // Fallback - пробуем project-issue
      router.push({
        name: 'project-issue',
        params: {
          project_hash: requirement.project_hash,
          issue_hash: requirement.issue_hash
        }
      });
    }
  } else if (requirement?.project_hash) {
    // Определяем тип целевого проекта (проект или компонент)
    try {
      const projectData = await ProjectApi.loadProject({
        hash: requirement.project_hash,
      });

      if (projectData) {
        // Если у проекта есть parent_hash, это компонент
        const routeName = projectData.parent_hash ? 'component-description' : 'project-description';

        router.push({
          name: routeName,
          params: {
            project_hash: requirement.project_hash
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при определении типа проекта:', error);
      // Fallback - переходим на страницу проекта
      router.push({
        name: 'project-description',
        params: {
          project_hash: requirement.project_hash
        }
      });
    }
  }
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

// Загрузка названий источников для видимых требований
const loadVisibleTitles = async () => {
  if (requirements.value?.items) {
    const loadPromises = requirements.value.items.map(req => loadSourceTitle(req));
    await Promise.allSettled(loadPromises);
  }
};

// Watcher для загрузки названий при изменении требований
watch(requirements, async (newRequirements) => {
  if (newRequirements?.items) {
    await loadVisibleTitles();
  }
}, { immediate: true });

// Инициализация
onMounted(async () => {
  await loadRequirements();
  await loadVisibleTitles();
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
