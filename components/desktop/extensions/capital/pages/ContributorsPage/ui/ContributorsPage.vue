<template lang="pug">
div
  q-card(flat)
    // Кнопка импорта участников
    q-card-actions
      ImportContributorsButton


    // Таблица участников
    ContributorsListWidget(
      :contributors='contributorStore.contributors?.items || []',
      :loading='loading',
      :pagination='pagination',
      @request='onRequest'
    )
    // Пагинация
    q-card-actions(align='center')
      q-pagination(
        v-model='pagination.page',
        :max='Math.ceil((contributorStore.contributors?.totalCount || 0) / pagination.rowsPerPage)',
        :max-pages='5',
        direction-links,
        boundary-links,
        @update:model-value='onPageChange'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { ContributorsListWidget } from 'app/extensions/capital/widgets/ContributorsListWidget';
import { ImportContributorsButton } from 'app/extensions/capital/widgets/ImportContributorsButton';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';

const contributorStore = useContributorStore();
const { info } = useSystemStore();

const loading = ref(false);

// Пагинация
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

// Загрузка участников
const loadContributors = async () => {
  loading.value = true;
  try {
    await contributorStore.loadContributors({
      filter: {
        coopname: info.coopname,
      },
      pagination: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
      },
    });
  } catch (error) {
    console.error('Ошибка при загрузке участников:', error);
    FailAlert('Не удалось загрузить список участников');
  } finally {
    loading.value = false;
  }
};

// Обработчик запросов пагинации и сортировки
const onRequest = async (props: { pagination: any }) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  await loadContributors();
};

// Обработчик изменения страницы пагинации
const onPageChange = async (page: number) => {
  pagination.value.page = page;
  await loadContributors();
};

/**
 * Функция для перезагрузки данных участников
 * Используется для poll обновлений
 */
const reloadContributors = async () => {
  try {
    await contributorStore.loadContributors({
      filter: {
        coopname: info.coopname,
      },
      pagination: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
      },
    });
  } catch (error) {
    console.warn('Ошибка при перезагрузке участников в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startContributorsPoll, stop: stopContributorsPoll } = useDataPoller(
  reloadContributors,
  { interval: POLL_INTERVALS.MEDIUM, immediate: false }
);

// Инициализация
onMounted(async () => {
  await loadContributors();

  // Запускаем poll обновление данных
  startContributorsPoll();
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(() => {
  stopContributorsPoll();
});
</script>

<style lang="scss" scoped>
.q-card {
  min-height: 400px;
}

h5 {
  font-weight: 600;
  color: #1976d2;
}
</style>
