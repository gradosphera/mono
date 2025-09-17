<template lang="pug">
div
  // Заголовок виджета
  q-card-section.q-pb-sm
    .row.items-center.q-gutter-sm
      q-icon(name='history', size='20px')
      .text-h6 Истории
      q-space
      q-btn(
        v-if='canCreate',
        icon='add',
        flat,
        round,
        dense,
        color='primary',
        @click='showCreateForm = !showCreateForm'
      )

  // Форма создания истории
  q-card-section.q-pa-none.q-mb-md(v-if='showCreateForm')
    .row.items-center.q-gutter-sm
      q-input(
        ref='titleInput',
        v-model='newStoryTitle',
        placeholder='Введите название истории...',
        dense,
        outlined,
        hide-bottom-space,
        autofocus,
        @keydown.enter='handleCreateStory',
        @keydown.escape='cancelCreate',
        :loading='creating'
      )
      q-btn(
        icon='check',
        flat,
        round,
        dense,
        color='positive',
        @click='handleCreateStory',
        :loading='creating'
      )
      q-btn(
        icon='close',
        flat,
        round,
        dense,
        color='negative',
        @click='cancelCreate'
      )

  // Список историй
  q-card-section.q-pa-none
    .stories-list
      q-item(
        v-for='story in stories?.items || []',
        :key='story._id',
        clickable,
        v-ripple,
        @click='onStoryClick(story)'
      )
        q-item-section(avatar)
          q-icon(name='history', color='primary')
        q-item-section
          .text-body2.font-weight-medium {{ story.title }}
          .text-caption.text-grey-6 {{ formatDate(story.created_at) }}
        q-item-section(side)
          q-chip(
            :color='getStoryStatusColor(story.status)',
            text-color='white',
            dense,
            size='sm',
            :label='getStoryStatusLabel(story.status)'
          )

      // Заглушка если нет историй
      div(v-if='!loading && (!stories?.items || stories.items.length === 0)')
        .text-center.q-pa-md
          q-icon(name='history', size='48px', color='grey-4')
          .text-body2.text-grey-6.q-mt-sm
            | {{ emptyMessage }}

      // Загрузка
      div(v-if='loading')
        .text-center.q-pa-md
          q-spinner(color='primary', size='24px')
          .text-body2.text-grey-6.q-mt-sm Загрузка историй...
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import {
  useStoryStore,
  type IStory,
  type IGetStoriesInput,
  type ICreateStoryInput,
} from 'app/extensions/capital/entities/Story/model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { date } from 'quasar';

// Props для конфигурации виджета
interface Props {
  // Фильтр для загрузки историй
  filter?: Partial<IGetStoriesInput['filter']>;
  // Показывать ли кнопку создания
  canCreate?: boolean;
  // Максимальное количество историй для отображения
  maxItems?: number;
  // Сообщение когда нет историй
  emptyMessage?: string;
  // Callback при клике на историю
  onStoryClick?: (story: IStory) => void | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  canCreate: true,
  maxItems: 50,
  emptyMessage: 'Историй пока нет',
  onStoryClick: undefined,
});

const { info } = useSystemStore();
const sessionStore = useSessionStore();
const storyStore = useStoryStore();

// Реактивные переменные
const loading = ref(false);
const creating = ref(false);
const showCreateForm = ref(false);
const newStoryTitle = ref('');
const titleInput = ref();

// Вычисляемые свойства
const stories = computed(() => {
  if (!storyStore.stories) return null;

  // Ограничиваем количество элементов если указано maxItems
  if (props.maxItems && storyStore.stories.items.length > props.maxItems) {
    return {
      ...storyStore.stories,
      items: storyStore.stories.items.slice(0, props.maxItems),
    };
  }

  return storyStore.stories;
});

// Утилиты для статусов историй (пока используем простые цвета)
const getStoryStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'orange',
    IN_PROGRESS: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
  };
  return colors[status] || 'grey';
};

const getStoryStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Ожидает',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Завершена',
    CANCELLED: 'Отменена',
  };
  return labels[status] || status;
};

// Форматирование даты
const formatDate = (dateStr: string) => {
  try {
    return date.formatDate(new Date(dateStr), 'DD.MM.YYYY HH:mm');
  } catch {
    return dateStr;
  }
};

// Загрузка историй
const loadStories = async () => {
  loading.value = true;
  try {
    const filter: IGetStoriesInput['filter'] = {
      coopname: info.coopname,
      ...props.filter,
    };

    const options: IGetStoriesInput['options'] = {
      page: 1,
      limit: props.maxItems,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };

    await storyStore.loadStories({ filter, options });
  } catch (error) {
    console.error('Ошибка при загрузке историй:', error);
    FailAlert('Не удалось загрузить истории');
  } finally {
    loading.value = false;
  }
};

// Создание истории
const handleCreateStory = async () => {
  if (!newStoryTitle.value.trim()) return;
  if (!sessionStore.username || sessionStore.username === '') {
    FailAlert('Необходимо авторизоваться');
    return;
  }

  creating.value = true;
  try {
    // Подготавливаем данные для создания истории
    const currentUsername = sessionStore.username;
    if (!currentUsername) {
      throw new Error('Username is required');
    }

    const storyData = {
      title: newStoryTitle.value.trim(),
      created_by: currentUsername as string,
      ...props.filter, // Добавляем фильтр (project_hash или issue_id)
    } as ICreateStoryInput;

    await storyStore.createStory(storyData);
    SuccessAlert('История создана');

    // Сбрасываем форму
    newStoryTitle.value = '';
    showCreateForm.value = false;

    // Список обновится автоматически через store
  } catch (error) {
    console.error('Ошибка при создании истории:', error);
    FailAlert('Не удалось создать историю');
  } finally {
    creating.value = false;
  }
};

// Отмена создания
const cancelCreate = () => {
  newStoryTitle.value = '';
  showCreateForm.value = false;
};

// Обработчик клика по истории
const onStoryClick = (story: IStory) => {
  if (props.onStoryClick) {
    props.onStoryClick(story);
  }
};

// Фокус на поле ввода при показе формы
watch(showCreateForm, async (newValue) => {
  if (newValue && titleInput.value) {
    await nextTick();
    titleInput.value.focus();
  }
});

// Инициализация
onMounted(async () => {
  await loadStories();
});
</script>

<style lang="scss" scoped>
.stories-list {
  max-height: 400px;
  overflow-y: auto;

  .q-item {
    border-radius: 8px;
    margin-bottom: 4px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}

.text-h6 {
  margin-bottom: 8px;
}
</style>
