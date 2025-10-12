<template lang="pug">
div
  q-card(flat)
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
import { CommitsListWidget } from 'app/extensions/capital/widgets';

// Ключи для сохранения состояния в LocalStorage
const COMMITS_EXPANDED_KEY = 'capital_commits_expanded';

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
