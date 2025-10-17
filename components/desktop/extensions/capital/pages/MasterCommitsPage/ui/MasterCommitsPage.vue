<template lang="pug">
div
  WindowLoader(v-show='isInitialLoading', text='Загрузка коммитов...')
  q-card(v-show='!isInitialLoading', flat)
    div

      // Виджет списка коммитов
      CommitsListWidget(
        :expanded='expanded',
        @toggle-expand='handleCommitToggleExpand',
        @commit-click='handleCommitClick',
        @data-loaded='handleCommitsDataLoaded'
      )
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useExpandableState } from 'src/shared/lib/composables';
import { WindowLoader } from 'src/shared/ui/Loader';
import { CommitsListWidget } from 'app/extensions/capital/widgets';

// Ключи для сохранения состояния в LocalStorage
const COMMITS_EXPANDED_KEY = 'capital_commits_expanded';

// Состояние первичной загрузки (WindowLoader)
const isInitialLoading = ref(true);

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

// Инициализация состояния при монтировании
const initPage = async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadCommitsExpandedState();
};

// Вызываем инициализацию
initPage();
</script>

<style lang="scss" scoped>
// Стили если необходимо
</style>
