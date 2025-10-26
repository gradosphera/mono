<template lang="pug">
div
  WindowLoader(v-show='isInitialLoading', text='Загрузка коммитов...')
  q-card(v-show='!isInitialLoading', flat)
    div

      // Виджет списка коммитов
      CommitsListWidget(
        :expanded='expanded',
        :force-reload='forceReload',
        @toggle-expand='handleCommitToggleExpand',
        @commit-click='handleCommitClick',
        @data-loaded='handleCommitsDataLoaded'
        @pagination-changed='handlePaginationChanged'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useExpandableState, useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
import { WindowLoader } from 'src/shared/ui/Loader';
import { CommitsListWidget } from 'app/extensions/capital/widgets';
import { useSystemStore } from 'src/entities/System/model';
import { useCommitStore } from 'app/extensions/capital/entities/Commit/model';

// Ключи для сохранения состояния в LocalStorage
const COMMITS_EXPANDED_KEY = 'capital_commits_expanded';

// Состояние первичной загрузки (WindowLoader)
const isInitialLoading = ref(true);

// Состояние для принудительной перезагрузки данных
const forceReload = ref(0);

// Текущее состояние пагинации для poll обновлений
const currentPage = ref(1);
const currentRowsPerPage = ref(100);
const currentSortBy = ref('created_at');
const currentDescending = ref(true);

// Инициализация store'ов
const { info } = useSystemStore();
const commitStore = useCommitStore();

// Управление развернутостью коммитов
const {
  expanded,
  loadExpandedState: loadCommitsExpandedState,
  cleanupExpandedByKeys: cleanupCommitsExpanded,
  toggleExpanded: toggleCommitExpanded,
} = useExpandableState(COMMITS_EXPANDED_KEY);

// Состояние для подсчета общего количества элементов
const totalCommitsCount = ref(0);

const handleCommitClick = (commitHash: string) => {
  // Клик на строку коммита приводит к развороту/свертыванию
  toggleCommitExpanded(commitHash);
};

const handleCommitToggleExpand = (commitHash: string) => {
  toggleCommitExpanded(commitHash);
};

const handleCommitsDataLoaded = (commitHashes: string[]) => {
  // Очищаем устаревшие записи expanded коммитов после загрузки данных
  cleanupCommitsExpanded(commitHashes);

  // Сохраняем количество коммитов для indeterminate логики
  totalCommitsCount.value = commitHashes.length;

  // Отключаем WindowLoader после завершения первичной загрузки
  isInitialLoading.value = false;
};

const handlePaginationChanged = (paginationData: { page: number; rowsPerPage: number; sortBy: string; descending: boolean }) => {
  // Сохраняем текущую пагинацию для poll обновлений
  currentPage.value = paginationData.page;
  currentRowsPerPage.value = paginationData.rowsPerPage;
  currentSortBy.value = paginationData.sortBy;
  currentDescending.value = paginationData.descending;
};

/**
 * Функция для перезагрузки данных коммитов
 * Используется для poll обновлений
 */
const reloadCommitsData = async () => {
  try {
    // Используем store для загрузки данных с текущими параметрами пагинации
    await commitStore.loadCommits({
      filter: {
        coopname: info.coopname,
      },
      options: {
        page: currentPage.value,
        limit: currentRowsPerPage.value,
        sortBy: currentSortBy.value,
        sortOrder: currentDescending.value ? 'DESC' : 'ASC',
      },
    });
  } catch (error) {
    console.warn('Ошибка при перезагрузке данных коммитов в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startCommitsPoll, stop: stopCommitsPoll } = useDataPoller(
  reloadCommitsData,
  { interval: POLL_INTERVALS.MEDIUM, immediate: false }
);

// Инициализация состояния при монтировании
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadCommitsExpandedState();

  // Запускаем poll обновление данных
  startCommitsPoll();
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(() => {
  stopCommitsPoll();
});
</script>

<style lang="scss" scoped>
// Стили если необходимо
</style>
