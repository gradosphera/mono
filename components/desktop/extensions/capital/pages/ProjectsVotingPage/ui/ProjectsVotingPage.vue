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
          // Виджет участников голосования
          ProjectVotingSegmentsWidget(
            :project-hash='project.project_hash',
            :coopname='info.coopname',
            :expanded='expandedSegments',
            :project='project',
            :current-username='username',
            @toggle-expand='handleSegmentToggleExpand',
            @segment-click='handleSegmentClick',
            @data-loaded='handleSegmentsDataLoaded'
          )
            template(#segment-content='{ segment }')
              // Виджет голосов участника
              SegmentVotesWidget(
                :project-hash='project.project_hash',
                :coopname='info.coopname',
                :segment-username='segment.username'
              )
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useExpandableState } from 'src/shared/lib/composables';
import 'src/shared/ui/TitleStyles';
import { ListVotingProjectWidget, ProjectVotingSegmentsWidget, SegmentVotesWidget } from 'app/extensions/capital/widgets';
import { useSessionStore } from 'src/entities/Session';

const { info } = useSystemStore();

const { username } = useSessionStore();
// Ключи для сохранения состояния в LocalStorage
const PROJECTS_EXPANDED_KEY = 'capital_voting_projects_expanded';
const SEGMENTS_EXPANDED_KEY = 'capital_voting_segments_expanded';

// Управление развернутостью проектов
const {
  expanded: expandedProjects,
  loadExpandedState: loadProjectsExpandedState,
  cleanupExpandedByKeys: cleanupProjectsExpanded,
  toggleExpanded: toggleProjectExpanded,
} = useExpandableState(PROJECTS_EXPANDED_KEY);

// Управление развернутостью сегментов (вкладчиков)
const {
  expanded: expandedSegments,
  loadExpandedState: loadSegmentsExpandedState,
  cleanupExpandedByKeys: cleanupSegmentsExpanded,
  toggleExpanded: toggleSegmentExpanded,
} = useExpandableState(SEGMENTS_EXPANDED_KEY);

const handleProjectClick = (projectHash: string) => {
  // Клик на строку проекта приводит к развороту/свертыванию
  toggleProjectExpanded(projectHash);
};

const handleProjectToggleExpand = (projectHash: string) => {
  toggleProjectExpanded(projectHash);
};

const handleSegmentToggleExpand = (username: string) => {
  toggleSegmentExpanded(username);
};

const handleProjectsDataLoaded = (projectHashes: string[]) => {
  // Очищаем устаревшие записи expanded проектов после загрузки данных
  cleanupProjectsExpanded(projectHashes);
};

const handleSegmentsDataLoaded = (usernames: string[]) => {
  // Очищаем устаревшие записи expanded сегментов после загрузки данных
  cleanupSegmentsExpanded(usernames);
};

const handleSegmentClick = (username: string) => {
  // Клик на строку сегмента приводит к развороту/свертыванию
  toggleSegmentExpanded(username);
};

// Инициализация
onMounted(async () => {
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadProjectsExpandedState();
  loadSegmentsExpandedState();
});
</script>
