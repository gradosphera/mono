<template lang="pug">
div
  q-card(flat)
    div
      // Виджет списка проектов на голосовании
      ListVotingProjectWidget(
        :coopname='info.coopname',
        :expanded='expandedProjects',
        @toggle-expand='handleProjectToggleExpand',
        @project-click='handleProjectClick',
        @data-loaded='handleProjectsDataLoaded'
      )
        template(#project-content='{ project }')
          ProjectVotesWidget(
            :project-hash='project.project_hash',
            :coopname='info.coopname',
            :expanded='expandedVotes',
            @toggle-expand='handleVoteToggleExpand',
            @vote-click='handleVoteClick',
            @data-loaded='handleVotesDataLoaded'
          )
</template>

<script lang="ts" setup>
import { onMounted, markRaw } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useHeaderActions } from 'src/shared/hooks';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { ListVotingProjectWidget, ProjectVotesWidget } from 'app/extensions/capital/widgets';

const { info } = useSystemStore();

// Регистрируем кнопку создания проекта в header
const { registerAction } = useHeaderActions();

// Ключи для сохранения состояния в LocalStorage
const PROJECTS_EXPANDED_KEY = 'capital_voting_projects_expanded';
const VOTES_EXPANDED_KEY = 'capital_voting_votes_expanded';

// Управление развернутостью проектов
const {
  expanded: expandedProjects,
  loadExpandedState: loadProjectsExpandedState,
  cleanupExpandedByKeys: cleanupProjectsExpanded,
  toggleExpanded: toggleProjectExpanded,
} = useExpandableState(PROJECTS_EXPANDED_KEY);

// Управление развернутостью голосований
const {
  expanded: expandedVotes,
  loadExpandedState: loadVotesExpandedState,
  cleanupExpandedByKeys: cleanupVotesExpanded,
  toggleExpanded: toggleVoteExpanded,
} = useExpandableState(VOTES_EXPANDED_KEY);

const handleProjectClick = (projectHash: string) => {
  // Клик на строку проекта приводит к развороту/свертыванию
  toggleProjectExpanded(projectHash);
};

const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleVoteToggleExpand = (voteHash: string) => {
  toggleVoteExpanded(voteHash);
};

const handleProjectsDataLoaded = (projectHashes: string[]) => {
  // Очищаем устаревшие записи expanded проектов после загрузки данных
  cleanupProjectsExpanded(projectHashes);
};

const handleVotesDataLoaded = (voteHashes: string[]) => {
  // Очищаем устаревшие записи expanded голосований после загрузки данных
  cleanupVotesExpanded(voteHashes);
};

const handleVoteClick = (voteHash: string) => {
  // Клик на строку голосования приводит к развороту/свертыванию
  toggleVoteExpanded(voteHash);
};

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadVotesExpandedState();

  registerAction({
    id: 'voting-actions',
    component: markRaw(() => null), // Можно добавить кнопки управления голосованиями если нужно
    order: 1,
  });
});
</script>

<style lang="scss" scoped>
.q-card {
  min-height: 400px;
}
</style>
