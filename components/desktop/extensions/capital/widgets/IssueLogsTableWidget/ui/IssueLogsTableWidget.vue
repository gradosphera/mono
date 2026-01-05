<template lang="pug">
div
  // Список логов с бесконечной прокруткой
  q-list(separator)
    q-item(v-for='log in logs', :key='log._id')
      q-item-section(avatar)
        q-icon(
          :name='getEventTypeIcon(log.event_type)',
          :color='getEventTypeColor(log.event_type)',
          size='sm'
        )
      q-item-section
        q-item-label {{ log.message }}
        q-item-label.caption.text-grey-6 {{ formatDate(log.created_at) }}

    // Индикатор загрузки следующей страницы
    q-inner-loading(
      v-if='loading && logs.length > 0',
      showing,
      color='primary'
    )

    // Триггер для автозагрузки
    q-intersection(
      v-if='hasMorePages && !loading',
      @visibility='loadNextPage',
      once
    )

    // Сообщение об отсутствии данных
    .text-center.q-pa-lg.text-grey-6(v-if='logs.length === 0 && !loading')
      | Нет записей в истории задачи
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useIssueStore } from 'app/extensions/capital/entities/Issue/model';
import { FailAlert } from 'src/shared/api';
import { Zeus } from '@coopenomics/sdk';

const LogEventType = Zeus.LogEventType;

interface Props {
  issueHash: string;
  refreshTrigger?: number;
}

const props = defineProps<Props>();

const issueStore = useIssueStore();

// Состояние
const logs = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const hasMorePages = ref(true);
const pageSize = 20;

// Загрузка логов задачи
const loadLogs = async (page = 1, append = false) => {
  if (append) {
    loading.value = true;
  }

  try {
    const result = await issueStore.loadIssueLogs({
      data: {
        issue_hash: props.issueHash
      },
      options: {
        page,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      },
    });

    if (append) {
      logs.value = [...logs.value, ...result.items];
    } else {
      logs.value = result.items;
    }

    // Проверяем, есть ли еще страницы
    hasMorePages.value = result.items.length === pageSize;
  } catch (error) {
    console.error('Ошибка при загрузке логов задачи:', error);
    FailAlert('Не удалось загрузить историю задачи');
  } finally {
    loading.value = false;
  }
};

// Загрузка следующей страницы
const loadNextPage = () => {
  if (!loading.value && hasMorePages.value) {
    currentPage.value++;
    loadLogs(currentPage.value, true);
  }
};

// Форматирование даты
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Получение иконки для типа события
const getEventTypeIcon = (eventType: Zeus.LogEventType): string => {
  const iconMap: Record<string, string> = {
    [LogEventType.PROJECT_CREATED]: 'add_circle',
    [LogEventType.PROJECT_EDITED]: 'edit',
    [LogEventType.PROJECT_STARTED]: 'play_arrow',
    [LogEventType.PROJECT_STOPPED]: 'stop',
    [LogEventType.PROJECT_CLOSED]: 'lock',
    [LogEventType.PROJECT_OPENED]: 'lock_open',
    [LogEventType.COMPONENT_CREATED]: 'add_circle_outline',
    [LogEventType.CONTRIBUTOR_JOINED]: 'person_add',
    [LogEventType.INVESTMENT_RECEIVED]: 'attach_money',
    [LogEventType.COMMIT_RECEIVED]: 'code',
    [LogEventType.ISSUE_CREATED]: 'bug_report',
    [LogEventType.ISSUE_UPDATED]: 'edit_note',
    [LogEventType.STORY_CREATED]: 'description',
    [LogEventType.STORY_UPDATED]: 'edit_document',
    [LogEventType.VOTING_STARTED]: 'how_to_vote',
    [LogEventType.VOTE_SUBMITTED]: 'check_circle',
    [LogEventType.RESULT_PUSHED]: 'assignment_turned_in',
    [LogEventType.PROJECT_MASTER_ASSIGNED]: 'admin_panel_settings',
    [LogEventType.AUTHOR_ADDED]: 'group_add',
    [LogEventType.FUNDS_ALLOCATED]: 'account_balance',
    [LogEventType.EXPENSE_CREATED]: 'receipt',
    [LogEventType.DEBT_CREATED]: 'credit_card',
  };

  return iconMap[eventType] || 'info';
};

// Получение цвета для типа события
const getEventTypeColor = (eventType: Zeus.LogEventType): string => {
  const colorMap: Record<string, string> = {
    [LogEventType.PROJECT_CREATED]: 'positive',
    [LogEventType.PROJECT_EDITED]: 'info',
    [LogEventType.PROJECT_STARTED]: 'positive',
    [LogEventType.PROJECT_STOPPED]: 'negative',
    [LogEventType.PROJECT_CLOSED]: 'warning',
    [LogEventType.PROJECT_OPENED]: 'positive',
    [LogEventType.COMPONENT_CREATED]: 'primary',
    [LogEventType.CONTRIBUTOR_JOINED]: 'secondary',
    [LogEventType.INVESTMENT_RECEIVED]: 'positive',
    [LogEventType.COMMIT_RECEIVED]: 'info',
    [LogEventType.ISSUE_CREATED]: 'warning',
    [LogEventType.ISSUE_UPDATED]: 'info',
    [LogEventType.STORY_CREATED]: 'primary',
    [LogEventType.STORY_UPDATED]: 'info',
    [LogEventType.VOTING_STARTED]: 'accent',
    [LogEventType.VOTE_SUBMITTED]: 'positive',
    [LogEventType.RESULT_PUSHED]: 'positive',
    [LogEventType.PROJECT_MASTER_ASSIGNED]: 'warning',
    [LogEventType.AUTHOR_ADDED]: 'secondary',
    [LogEventType.FUNDS_ALLOCATED]: 'positive',
    [LogEventType.EXPENSE_CREATED]: 'negative',
    [LogEventType.DEBT_CREATED]: 'warning',
  };

  return colorMap[eventType] || 'grey';
};

// Watcher для изменения issueId
watch(
  () => props.issueHash,
  async (newHash, oldHash) => {
    if (newHash && newHash !== oldHash) {
      currentPage.value = 1;
      hasMorePages.value = true;
      await loadLogs(1, false);
    }
  },
);

// Инициализация
onMounted(async () => {
  await loadLogs(1, false);
});

// Следим за изменениями issueHash для перезагрузки логов при смене задачи
watch(() => props.issueHash, async (newValue, oldValue) => {
  if (newValue !== oldValue && newValue) {
    await loadLogs(1, false);
  }
});

// Следим за изменениями refreshTrigger для перезагрузки логов
watch(() => props.refreshTrigger, async (newValue, oldValue) => {
  if (newValue !== oldValue && newValue !== undefined) {
    console.log('refreshTrigger', newValue)
    // Небольшая задержка для синхронизации базы данных
    await new Promise(resolve => setTimeout(resolve, 3000));
    await loadLogs(1, false);
  }
});
</script>

<style lang="scss" scoped>
.q-list {
  .q-item {
    min-height: 60px;
    padding: 12px 16px;
  }

  .q-item__section--avatar {
    min-width: 40px;
  }
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>
